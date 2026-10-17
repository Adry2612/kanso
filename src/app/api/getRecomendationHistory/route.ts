import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const db = adminDb();
    const historySnapshot = await db
      .collection(`users/${uid}/recomendationHistory`)
      .orderBy("providedAt", "desc")
      .get();

    if (historySnapshot.empty) {
      return NextResponse.json({ history: [] }, { status: 200 });
    }

    const history = await Promise.all(
      historySnapshot.docs.map(async (historyDoc) => {
        const { albumId, moods, providedAt } = historyDoc.data();

        const albumSnap = await db.doc(`albums/${albumId}`).get();

        return {
          id: historyDoc.id,
          albumId,
          moods: moods || [],
          providedAt: providedAt?.toDate?.()?.toISOString() || providedAt,
          album: albumSnap.exists ? albumSnap.data() : null,
        };
      }),
    );

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener el historial de recomendaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial" },
      { status: 500 },
    );
  }
}
