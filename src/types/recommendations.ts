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
  activities?: string[];
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
  activities: string[];
  albumInfo?: RecommendedAlbumInfo;
};

export type ActivityRecommendationsResult = {
  optimalMoods: string[];
  recommendations: ActivityRecommendation[];
  recommendedAlbum: RecommendedAlbum | null;
  explain?: RecommendationExplanation;
};

/** Desglose de la puntuación de un candidato. */
export type RecommendationScoreBreakdown = {
  /** Proporción de emociones pedidas presentes en las etiquetas (0..1). */
  labelOverlap: number;
  /** Coincidencia de etiquetas, antes de recencia y valoración. */
  baseScore: number;
  /** Penalización por haber sido recomendado hace poco (0..1). */
  recencyPenalty: number;
  /** Ajuste por valoraciones (-1..1). */
  feedbackBoost: number;
  finalScore: number;
};

export type RecommendationCandidateExplanation = {
  albumId: string;
  albumName: string;
  matchingMoods: string[];
  score: RecommendationScoreBreakdown;
};

/** Explicación estructurada de una recomendación, solo con datos propios. */
export type RecommendationExplanation = {
  filters: {
    moods: string[];
    activity: string | null;
    format: string;
    tags: string[];
  };
  counts: {
    collection: number;
    afterFilters: number;
  };
  weights: {
    recent: number;
    feedback: number;
  };
  selected: RecommendationCandidateExplanation;
  alternatives: RecommendationCandidateExplanation[];
};

/** Entrada de la colección tal como se guarda en `users/{uid}/collection`. */
export type ActivityCollectionRecord = {
  id: string;
  albumId: string;
  format?: string | string[];
  ownership?: { format?: string | string[] };
  tags?: { category?: string; value?: string }[];
  labeledFeelings?: unknown[];
  feelings?: unknown[];
  activities?: string[];
};

export type ComputeActivityRecommendationsParams = {
  collection: ActivityCollectionRecord[];
  activity: string;
  translateMood?: MoodTranslator;
  translateActivity?: ActivityTranslator;
  format?: string;
  requiredMoods?: string[];
  requiredTags?: string[];
  /** Últimas recomendaciones, de la más reciente a la más antigua. */
  recentAlbumIds?: string[];
  /** Valoraciones guardadas por álbum. */
  feedbackByAlbum?: Map<string, { liked: boolean; topMoods: string[] }>;
  /** Resuelve el detalle del álbum (el servidor lo hace con el Admin SDK). */
  getAlbum: (albumId: string) => Promise<RecommendedAlbumInfo | undefined>;
};

/** Valoración guardada de una recomendación. */
export type RecommendationFeedback = {
  albumId: string;
  liked: boolean;
  topMoods: string[];
};

/** Respuesta de `POST /api/getAlbumsByMood` (recomendación por emoción). */
export interface MoodRecommendationResponse {
  id: string;
  albumId: string;
  format?: string | string[];
  tags?: { category?: string; value?: string }[];
  labeledFeelings: string[];
  activities: string[];
  albumInfo?: RecommendedAlbumInfo;
  explain?: RecommendationExplanation;
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
