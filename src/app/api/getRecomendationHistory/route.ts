import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Falta el userId" }, { status: 400 });
    }

    const historyCollection = collection(
      db,
      "users",
      userId,
      "recomendationHistory",
    );
    const q = query(historyCollection, orderBy("providedAt", "desc"));
    const historySnapshot = await getDocs(q);

    if (historySnapshot.empty) {
      return NextResponse.json({ history: [] }, { status: 200 });
    }

    const history = await Promise.all(
      historySnapshot.docs.map(async (historyDoc) => {
        const data = historyDoc.data();
        const { albumId, moods, providedAt } = data;

        const albumDoc = doc(db, "albums", albumId);
        const albumSnap = await getDoc(albumDoc);

        return {
          id: historyDoc.id,
          albumId,
          moods: moods || [],
          providedAt: providedAt?.toDate?.()?.toISOString() || providedAt,
          album: albumSnap.exists() ? albumSnap.data() : null,
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
