import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { reportApiError } from "@/lib/sentry";

const LIST_LIMIT = 8;

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db
      .collection("communityAlbums")
      .orderBy("addedAt", "desc")
      .limit(LIST_LIMIT)
      .get();

    const albums = (
      await Promise.all(
        snapshot.docs.map(async (entry) => {
          const albumId = entry.data().albumId;
          if (!albumId) return null;

          const albumSnap = await db.doc(`albums/${albumId}`).get();
          if (!albumSnap.exists) return null;

          const data = albumSnap.data() ?? {};
          return {
            id: data.id ?? albumId,
            name: data.name ?? "",
            images: data.images ?? [],
            artists: data.artists ?? [],
          };
        }),
      )
    ).filter(Boolean);

    return NextResponse.json({ albums });
  } catch (error) {
    // Degradar sin romper la pantalla: el cliente trata la lista vacía.
    reportApiError(error, "communityAlbums", "warning");
    return NextResponse.json({ albums: [] });
  }
}
