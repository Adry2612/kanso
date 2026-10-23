import { normalizeMoods, type MoodKey } from "@/constants/moods";
import type {
  RecommendationHistoryAlbum,
  RecommendationHistoryItem,
} from "@/types/recommendations";

/** Emociones presentes en el historial, normalizadas y ordenadas. */
export function getHistoryMoods(items: RecommendationHistoryItem[]): MoodKey[] {
  return normalizeMoods(items.flatMap((item) => item.moods ?? [])).sort(
    (a, b) => a.localeCompare(b),
  );
}

/** Filtra por emoción y por texto del álbum o artista. */
export function filterRecommendationHistory(
  items: RecommendationHistoryItem[],
  query: string,
  moodFilter: MoodKey | null,
): RecommendationHistoryItem[] {
  const term = query.trim().toLowerCase();

  return items.filter((item) => {
    const matchesMood =
      !moodFilter || normalizeMoods(item.moods ?? []).includes(moodFilter);
    if (!matchesMood) return false;
    if (!term) return true;

    const artist = item.album?.artists?.[0]?.name ?? "";
    return `${item.album?.name ?? ""} ${artist}`.toLowerCase().includes(term);
  });
}

/** Número de artistas distintos en el historial. */
export function countHistoryArtists(
  items: RecommendationHistoryItem[],
): number {
  return new Set(
    items.map((item) => item.album?.artists?.[0]?.name).filter(Boolean),
  ).size;
}

/** Recomendaciones recientes con álbum resuelto, listas para pintar. */
export function getRecentRecommendations(
  items: RecommendationHistoryItem[],
  limit = 3,
): (RecommendationHistoryItem & { album: RecommendationHistoryAlbum })[] {
  return items
    .filter(
      (
        item,
      ): item is RecommendationHistoryItem & {
        album: RecommendationHistoryAlbum;
      } => Boolean(item.album?.id),
    )
    .slice(0, limit);
}
