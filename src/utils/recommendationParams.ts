import type { FavoriteFormat } from "@/types/favorites";

type RecommendationParams = {
  format: "all" | FavoriteFormat;
  moods?: string[];
  activities?: string[];
  tags?: string[];
};

/**
 * Construye la URL de recomendación. El tipo se decide por si hay actividad:
 * una actividad elige un único momento; las emociones se combinan.
 */
export function buildRecommendationHref({
  format,
  moods = [],
  activities = [],
  tags = [],
}: RecommendationParams): string {
  const params = new URLSearchParams({ format });
  moods.forEach((mood) => params.append("moods", mood));
  activities.forEach((activity) => params.append("activity", activity));
  tags.forEach((tag) => params.append("tag", tag));
  params.set("type", activities.length ? "activity" : "mood");
  return `/recommendation?${params.toString()}`;
}

/** Recomendación rápida: solo formato y, opcionalmente, una etiqueta. */
export function buildQuickRecommendationHref(
  format: "all" | FavoriteFormat,
  tag: string | null,
): string {
  const params = new URLSearchParams({ format });
  if (tag) params.append("tag", tag);
  params.set("type", "mood");
  return `/recommendation?${params.toString()}`;
}
