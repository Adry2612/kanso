/** Tipos compartidos de recomendaciones e historial. */

export interface RecommendedAlbumInfo {
  external_urls?: { spotify?: string };
  images: { url: string }[];
  name: string;
  artists: { name: string; id: string }[];
  release_date?: string;
  total_tracks?: number;
  id?: string;
}

export interface ActivityRecommendation {
  id: string;
  albumId: string;
  labeledFeelings: string[];
  matchingMoods: string[];
  compatibilityScore: number;
  albumInfo?: RecommendedAlbumInfo;
}

export interface ActivityRecommendationResponse {
  activity: string;
  optimalMoods: string[];
  recommendations: ActivityRecommendation[];
  totalFound: number;
  message?: string;
}

export type MoodTranslator = (key: string) => string;
export type ActivityTranslator = (key: string) => string;

export type FeelingTag = { label: string; emoji: string };

export type RecommendedAlbum = {
  feelings: FeelingTag[];
  albumId: string;
  labeledFeelings: string[];
  albumInfo?: RecommendedAlbumInfo;
};

export type ActivityRecommendationsResult = {
  optimalMoods: string[];
  recommendations: ActivityRecommendation[];
  recommendedAlbum: RecommendedAlbum | null;
};

/** Favorito tal como se guarda en `users/{uid}/favorites`. */
export type ActivityFavoriteRecord = {
  id: string;
  albumId: string;
  format?: string | string[];
  ownership?: { format?: string | string[] };
  tags?: { category?: string; value?: string }[];
  labeledFeelings?: unknown[];
  feelings?: unknown[];
};

export type ComputeActivityRecommendationsParams = {
  favorites: ActivityFavoriteRecord[];
  activity: string;
  translateMood?: MoodTranslator;
  translateActivity?: ActivityTranslator;
  format?: string;
  requiredMoods?: string[];
  requiredTags?: string[];
  /** Resuelve el detalle del álbum (el servidor lo hace con el Admin SDK). */
  getAlbum: (albumId: string) => Promise<RecommendedAlbumInfo | undefined>;
};

/** Respuesta de `POST /api/getAlbumsByMood` (recomendación por emoción). */
export interface MoodRecommendationResponse {
  id: string;
  albumId: string;
  format?: string | string[];
  tags?: { category?: string; value?: string }[];
  albumInfo?: RecommendedAlbumInfo;
}

export interface RecommendationHistoryAlbum {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  external_urls?: { spotify?: string };
}

/** Entrada de `GET /api/getRecomendationHistory`. */
export interface RecommendationHistoryItem {
  id: string;
  albumId?: string;
  providedAt: string;
  moods?: string[];
  album: RecommendationHistoryAlbum;
}

export interface RecommendationHistoryResponse {
  history: RecommendationHistoryItem[];
}
