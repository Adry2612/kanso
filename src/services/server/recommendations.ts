import "server-only";

import { adminDb } from "@/lib/firebaseAdmin";
import { computeActivityRecommendations } from "@/utils/recommendations";
import type {
  ActivityFavoriteRecord,
  ActivityRecommendationsResult,
  RecommendedAlbumInfo,
} from "@/types/recommendations";

/** Error con un estado HTTP que la ruta puede devolver tal cual. */
export class RecommendationApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "RecommendationApiError";
  }
}

export type ActivityRecommendationInput = {
  activity?: unknown;
  format?: unknown;
  requiredMoods?: unknown;
  requiredTags?: unknown;
};

/**
 * Lectura de la colección de la persona y cálculo de la recomendación por
 * actividad. El scoring puro vive en `utils/recommendations`.
 */
export async function recommendByActivity(
  uid: string,
  input: ActivityRecommendationInput,
): Promise<ActivityRecommendationsResult> {
  const { activity, format = "all", requiredMoods, requiredTags } = input;

  if (typeof activity !== "string" || !activity.trim()) {
    throw new RecommendationApiError(400, "Actividad no válida");
  }

  const db = adminDb();
  const favoritesSnapshot = await db.collection(`users/${uid}/favorites`).get();
  const favorites: ActivityFavoriteRecord[] = favoritesSnapshot.docs.map(
    (entry) => ({ id: entry.id, ...entry.data() }) as ActivityFavoriteRecord,
  );

  return computeActivityRecommendations({
    favorites,
    activity,
    format: typeof format === "string" ? format : "all",
    requiredMoods: Array.isArray(requiredMoods)
      ? (requiredMoods as string[])
      : [],
    requiredTags: Array.isArray(requiredTags) ? (requiredTags as string[]) : [],
    getAlbum: async (albumId) => {
      const albumSnap = await db.doc(`albums/${albumId}`).get();
      return albumSnap.exists
        ? (albumSnap.data() as RecommendedAlbumInfo)
        : undefined;
    },
  });
}
