import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

const MAX_TERM_LENGTH = 60;
const MIN_TERM_LENGTH = 3;
const LIST_LIMIT = 8;

/** Trim, collapse whitespace, lowercase and cap length. Returns null for empty terms. */
function normalizeTerm(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const term = raw.trim().replace(/\s+/g, " ").slice(0, MAX_TERM_LENGTH);
  return term.length > 0 ? term.toLocaleLowerCase("es") : null;
}

/** Firestore doc id: normalized term without slashes. */
function termToId(term: string): string {
  return term.replace(/\//g, " ");
}

export async function GET() {
  try {
    const snapshot = await adminDb()
      .collection("communitySearches")
      .orderBy("lastAt", "desc")
      .limit(LIST_LIMIT)
      .get();

    const searches = snapshot.docs.map((entry) => {
      const data = entry.data();
      return {
        term: normalizeTerm(data.term) ?? "",
        count: Number(data.count ?? 1),
        lastAt: data.lastAt?.toDate?.() ?? null,
      };
    });

    return NextResponse.json({ searches });
  } catch (error) {
    // Degradar sin romper la pantalla: el cliente trata la lista vacía.
    console.error("Error obteniendo búsquedas de la comunidad:", error);
    return NextResponse.json({ searches: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const term = normalizeTerm(body?.term);

    if (!term) {
      return NextResponse.json({ error: "Término inválido" }, { status: 400 });
    }

    if (term.length < MIN_TERM_LENGTH) {
      return NextResponse.json(
        { error: "Término demasiado corto" },
        { status: 400 },
      );
    }

    const db = adminDb();
    const ref = db.doc(`communitySearches/${termToId(term)}`);
    await ref.set(
      {
        term,
        count: FieldValue.increment(1),
        lastAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Coalesce partial prefixes: registrar "extremoduro" tras "extre" elimina el parcial.
    const previous = normalizeTerm(body?.previousTerm);
    if (previous && previous !== term && term.startsWith(previous)) {
      await db
        .doc(`communitySearches/${termToId(previous)}`)
        .delete()
        .catch((error) => {
          console.error("No se pudo eliminar el término parcial:", error);
        });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error registrando búsqueda de la comunidad:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
