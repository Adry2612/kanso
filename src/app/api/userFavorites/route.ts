import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { normalizeMoods } from "@/constants/moods";
import { normalizeFavoriteFormats } from "@/lib/favorites";

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const db = adminDb();
    const favSnapshot = await db.collection(`users/${uid}/favorites`).get();

    if (favSnapshot.empty) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await Promise.all(
      favSnapshot.docs.map(async (favDoc) => {
        const {
          albumId,
          addedAt,
          labeledFeelings,
          activities,
          tags,
          format,
          ownership,
        } = favDoc.data();
        const normalizedFormats = normalizeFavoriteFormats(format, ownership);

        const albumSnap = await db.doc(`albums/${albumId}`).get();

        return {
          id: favDoc.id,
          addedAt: addedAt?.toDate?.() ?? addedAt,
          savedAt: addedAt?.toDate?.() ?? addedAt,
          labeledFeelings: normalizeMoods(labeledFeelings ?? []),
          activities: activities ?? [],
          tags: Array.isArray(tags) ? tags : [],
          format: normalizedFormats,
          album: albumSnap.exists ? albumSnap.data() : null,
        };
      }),
    );

    favorites.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return NextResponse.json(
      { error: "No se pudo obtener la colección" },
      { status: 500 },
    );
  }
}
