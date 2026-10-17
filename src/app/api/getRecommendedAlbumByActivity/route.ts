import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import {
  computeActivityRecommendations,
  type ActivityFavoriteRecord,
} from "@/lib/activityRecommendations";
import type { RecommendedAlbumInfo } from "@/types/favorites";

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const {
      activity,
      format = "all",
      requiredMoods = [],
      requiredTags = [],
    }: {
      activity?: string;
      format?: string;
      requiredMoods?: string[];
      requiredTags?: string[];
    } = await request.json();

    if (typeof activity !== "string" || !activity.trim()) {
      return NextResponse.json(
        { error: "Actividad no válida" },
        { status: 400 },
      );
    }

    const db = adminDb();
    const favoritesSnapshot = await db
      .collection(`users/${uid}/favorites`)
      .get();
    const favorites: ActivityFavoriteRecord[] = favoritesSnapshot.docs.map(
      (entry) => ({ id: entry.id, ...entry.data() }) as ActivityFavoriteRecord,
    );

    const result = await computeActivityRecommendations({
      favorites,
      activity,
      format,
      requiredMoods: Array.isArray(requiredMoods) ? requiredMoods : [],
      requiredTags: Array.isArray(requiredTags) ? requiredTags : [],
      getAlbum: async (albumId) => {
        const albumSnap = await db.doc(`albums/${albumId}`).get();
        return albumSnap.exists
          ? (albumSnap.data() as RecommendedAlbumInfo)
          : undefined;
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error obteniendo la recomendación por actividad:", error);
    return NextResponse.json(
      { error: "No se pudo obtener la recomendación" },
      { status: 500 },
    );
  }
}
