/**
 * Compatibilidad temporal: las llamadas viven en
 * `services/client/recommendations`.
 */
export {
  getRecommendation as getRecomendation,
  getRecommendationHistory as getRecomendationHistory,
  getRecommendedAlbumByActivity,
  saveRecommendationHistory as saveRecomendationHistory,
} from "@/services/client/recommendations";
