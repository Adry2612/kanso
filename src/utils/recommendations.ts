/**
 * Recomendaciones por actividad.
 *
 * Este módulo NO accede a los datos por su cuenta: recibe las entradas de la colección ya
 * cargados y una función para resolver el detalle de cada álbum. Así la misma
 * lógica se puede ejecutar en el servidor (con el Admin SDK) sin arrastrar el
 * SDK de Firestore al cliente.
 */

import type {
  ActivityRecommendation,
  ActivityRecommendationsResult,
  ActivityTranslator,
  ComputeActivityRecommendationsParams,
  FeelingTag,
  MoodTranslator,
  RecommendationCandidateExplanation,
  RecommendationExplanation,
  RecommendationScoreBreakdown,
} from "@/types/recommendations";
import { getMood, normalizeMood } from "@/constants/moods";

export type {
  ActivityRecommendation,
  ActivityRecommendationsResult,
  ActivityTranslator,
  ActivityCollectionRecord,
  ComputeActivityRecommendationsParams,
  FeelingTag,
  MoodTranslator,
  RecommendationCandidateExplanation,
  RecommendationExplanation,
  RecommendationScoreBreakdown,
  RecommendedAlbum,
  RecommendedAlbumInfo,
} from "@/types/recommendations";

export const activityMoodMap: Record<string, string[]> = {
  working: ["inspiration", "calm", "energy", "nostalgia", "relaxation"],
  studying: ["calm", "relaxation", "inspiration", "nostalgia", "sleep"],
  exercising: ["energy", "ecstasy", "triumph", "challenge", "anger"],
  cooking: ["joy", "calm", "nostalgia", "love", "relaxation"],
  relaxing: ["relaxation", "calm", "nostalgia", "love", "sleep"],
  gaming: ["energy", "challenge", "ecstasy", "anger", "triumph"],
  commuting: ["energy", "nostalgia", "joy", "inspiration", "calm"],
  chores: ["energy", "joy", "triumph", "inspiration", "challenge"],
  party: ["ecstasy", "joy", "energy", "triumph", "challenge"],
};

/** Ventana de «hace poco» para la penalización por recencia. */
export const RECENT_WINDOW = 10;

/** Pesos del ranking; se pueden afinar sin tocar la estructura. */
export const W_RECENT = 0.35;
export const W_FEEDBACK = 0.5;

/** Señales que ajustan la puntuación de un candidato. */
export type RankingSignals = {
  /** Proporción de emociones pedidas presentes en las etiquetas (0..1). */
  labelOverlap: number;
  /** Penalización por haber sido recomendado hace poco (0..1). */
  recencyPenalty?: number;
  /** Ajuste por valoraciones: +1 me gustó, −1 no me gustó. */
  feedbackBoost?: number;
};

/** Valoración guardada de una recomendación. */
export type FeedbackSignal = { liked: boolean; topMoods: string[] };

/** Un candidato sin formato solo pasa cuando se pide «all». */
export function matchesCollectionFormat(
  format: string | string[] | undefined,
  selected: string,
): boolean {
  if (selected === "all") return true;
  return Array.isArray(format)
    ? format.includes(selected)
    : format === selected;
}

/** Un candidato sin etiquetas solo pasa cuando no se filtra por etiquetas. */
export function matchesRecommendationTags(
  tags: { category?: string; value?: string }[] | undefined,
  selected: string[],
): boolean {
  if (selected.length === 0) return true;
  if (!Array.isArray(tags)) return false;

  return selected.some((tag) =>
    tags.some(
      (entry) =>
        `${entry?.category ?? ""}:${entry?.value ?? ""}`.toLowerCase() ===
        tag.toLowerCase(),
    ),
  );
}

/** Proporción de `target` presentes en `values` (0..1). */
export function overlapRatio(
  values: readonly string[],
  target: readonly string[],
): number {
  if (target.length === 0) return 0;
  const set = new Set(values);
  return target.filter((item) => set.has(item)).length / target.length;
}

/**
 * Penalización por recencia: 1 para la recomendación más reciente y decreciente
 * hasta 0 fuera de la ventana. No excluye al álbum.
 */
export function recencyPenalty(
  albumId: string,
  recentAlbumIds: readonly string[] = [],
): number {
  const index = recentAlbumIds.slice(0, RECENT_WINDOW).indexOf(albumId);
  if (index === -1) return 0;
  return Math.max(0, 1 - index / RECENT_WINDOW);
}

/** Desglose completo de la puntuación de un candidato. */
export function scoreCandidateBreakdown({
  labelOverlap,
  recencyPenalty: recent = 0,
  feedbackBoost = 0,
}: RankingSignals): RecommendationScoreBreakdown {
  return {
    labelOverlap,
    baseScore: labelOverlap,
    recencyPenalty: recent,
    feedbackBoost,
    finalScore: labelOverlap - W_RECENT * recent + W_FEEDBACK * feedbackBoost,
  };
}

/** Puntuación de un candidato: etiquetas, recencia y valoración. */
export function scoreCandidate(signals: RankingSignals): number {
  return scoreCandidateBreakdown(signals).finalScore;
}

/**
 * Ajuste por valoraciones: el álbum valorado recibe el signo completo y los que
 * comparten alguna emoción principal, la mitad. Devuelve 0 sin valoraciones.
 */
export function feedbackBoostFor(
  albumId: string,
  albumMoods: readonly string[],
  feedback?: ReadonlyMap<string, FeedbackSignal>,
): number {
  if (!feedback || feedback.size === 0) return 0;

  const direct = feedback.get(albumId);
  if (direct) return direct.liked ? 1 : -1;

  let boost = 0;
  for (const [otherId, signal] of feedback) {
    if (otherId === albumId) continue;
    if (!signal.topMoods.some((mood) => albumMoods.includes(mood))) continue;
    const candidate = signal.liked ? 0.5 : -0.5;
    if (Math.abs(candidate) > Math.abs(boost)) boost = candidate;
  }
  return boost;
}

const activityLabelToKey: Record<string, string> = {
  working: "working",
  studying: "studying",
  exercising: "exercising",
  cooking: "cooking",
  relaxing: "relaxing",
  gaming: "gaming",
  commuting: "commuting",
  chores: "chores",
  party: "party",
};

export const moodLabelToKey: Record<string, string> = {
  Alegría: "joy",
  Tristeza: "sadness",
  Energía: "energy",
  Calma: "calm",
  Melancolía: "melancholy",
  Éxtasis: "ecstasy",
  Nostalgia: "nostalgia",
  Enfado: "anger",
  Inspiración: "inspiration",
  Amor: "love",
  Relajación: "relaxation",
  Ansiedad: "anxiety",
  Triunfo: "triumph",
  Sueño: "sleep",
  Desafío: "challenge",
};

const moodAliasToLabel: Record<string, string> = {
  feliz: "Alegría",
  happy: "Alegría",
  triste: "Tristeza",
  sad: "Tristeza",
  energetico: "Energía",
  energético: "Energía",
  energico: "Energía",
  energetic: "Energía",
  energy: "Energía",
  relajado: "Relajación",
  relajación: "Relajación",
  relajacion: "Relajación",
  relaxing: "Relajación",
  relaxed: "Relajación",
  calm: "Calma",
  melancholic: "Melancolía",
  melancolico: "Melancolía",
  melancólico: "Melancolía",
  inspired: "Inspiración",
  inspiration: "Inspiración",
  focused: "Inspiración",
  "very hopeful": "Inspiración",
  stressed: "Ansiedad",
  anxious: "Ansiedad",
  curious: "Inspiración",
  grateful: "Amor",
  romantic: "Amor",
};

export function getMoodsForActivity(activity: string): string[] {
  const normalized = activity.toLowerCase().trim();
  return activityMoodMap[normalized] || [];
}

export function resolveActivityKey(
  activity: string,
  translateActivity?: ActivityTranslator,
): string {
  const normalized = activity.toLowerCase().trim();
  if (activityMoodMap[normalized]) {
    return normalized;
  }

  if (!translateActivity) {
    return normalized;
  }

  const matchedKey = Object.keys(activityLabelToKey).find((key) => {
    const label = translateActivity(key);
    return label.toLowerCase().trim() === normalized;
  });

  return matchedKey || normalized;
}

export function getActivityLabel(
  activity: string,
  translateActivity?: ActivityTranslator,
): string {
  const normalized = resolveActivityKey(activity, translateActivity);
  if (!translateActivity) return activity;
  const key = activityLabelToKey[normalized];
  return key ? translateActivity(key) : activity;
}

function normalizeMoodLabel(label: unknown): string {
  let rawLabel = "";

  if (typeof label === "string") {
    rawLabel = label;
  } else if (label && typeof label === "object") {
    const candidate = (label as { label?: string; nombre?: string }).label;
    const nombre = (label as { nombre?: string }).nombre;
    rawLabel = candidate || nombre || "";
  }

  const canonicalMood = normalizeMood(rawLabel);
  if (canonicalMood) return canonicalMood;
  const trimmed = rawLabel.trim();
  if (moodLabelToKey[trimmed]) {
    return trimmed;
  }

  const normalized = trimmed.toLowerCase();
  return moodAliasToLabel[normalized] || trimmed;
}

function buildFeelingTags(
  moods: string[],
  translateMood?: MoodTranslator,
): FeelingTag[] {
  return moods.map((label) => {
    const match = getMood(label);
    return {
      label: translateMood ? translateMood(label) : match?.label || label,
      emoji: match?.emoji || "🎵",
    };
  });
}

export async function computeActivityRecommendations({
  collection,
  activity,
  translateMood,
  translateActivity,
  format = "all",
  requiredMoods = [],
  requiredTags = [],
  recentAlbumIds = [],
  feedbackByAlbum,
  getAlbum,
}: ComputeActivityRecommendationsParams): Promise<ActivityRecommendationsResult> {
  const normalizedActivity = resolveActivityKey(activity, translateActivity);
  const optimalMoods = getMoodsForActivity(normalizedActivity);

  if (optimalMoods.length === 0) {
    return { optimalMoods, recommendations: [], recommendedAlbum: null };
  }

  if (collection.length === 0) {
    return { optimalMoods, recommendations: [], recommendedAlbum: null };
  }

  const recommendations: ActivityRecommendation[] = [];
  const breakdowns = new Map<string, RecommendationScoreBreakdown>();

  for (const entry of collection) {
    if (
      format !== "all" &&
      !(Array.isArray(entry.format)
        ? entry.format.includes(format)
        : entry.format === format) &&
      !(Array.isArray(entry.ownership?.format)
        ? entry.ownership.format.includes(format)
        : entry.ownership?.format === format)
    ) {
      continue;
    }
    if (
      requiredTags.length > 0 &&
      !requiredTags.some((tag) =>
        entry.tags?.some(
          (entryTag: { category?: string; value?: string }) =>
            `${entryTag.category}:${entryTag.value}` === tag,
        ),
      )
    ) {
      continue;
    }
    const labeledFeelings = entry.labeledFeelings || entry.feelings || [];
    const normalizedFeelings = labeledFeelings
      .map((label: unknown) => normalizeMoodLabel(label))
      .filter((label: string) => label.length > 0);

    // `requiredMoods` sigue siendo un filtro explícito de la persona.
    if (
      requiredMoods.length > 0 &&
      !requiredMoods.some((mood) => normalizedFeelings.includes(mood))
    ) {
      continue;
    }

    const matchingMoods = normalizedFeelings.filter((mood: string) =>
      optimalMoods.includes(mood),
    );
    const labelOverlap =
      optimalMoods.length > 0 ? matchingMoods.length / optimalMoods.length : 0;

    // Sin audio no hay forma de justificar un álbum sin ninguna coincidencia.
    if (labelOverlap === 0) {
      continue;
    }

    const albumInfo = await getAlbum(entry.albumId);

    breakdowns.set(
      entry.id,
      scoreCandidateBreakdown({
        labelOverlap,
        recencyPenalty: recencyPenalty(entry.albumId, recentAlbumIds),
        feedbackBoost: feedbackBoostFor(
          entry.albumId,
          normalizedFeelings,
          feedbackByAlbum,
        ),
      }),
    );

    recommendations.push({
      id: entry.id,
      albumId: entry.albumId,
      labeledFeelings: normalizedFeelings,
      matchingMoods,
      activities: entry.activities ?? [],
      compatibilityScore: labelOverlap,
      albumInfo,
    });
  }

  recommendations.sort(
    (a, b) =>
      (breakdowns.get(b.id)?.finalScore ?? 0) -
      (breakdowns.get(a.id)?.finalScore ?? 0),
  );

  const best = recommendations[0];
  const recommendedAlbum = best
    ? {
        feelings: buildFeelingTags(best.matchingMoods, translateMood),
        albumId: best.albumId,
        labeledFeelings: best.labeledFeelings,
        activities: best.activities ?? [],
        albumInfo: best.albumInfo,
      }
    : null;

  const candidateExplanations: RecommendationCandidateExplanation[] =
    recommendations.flatMap((item) => {
      const score = breakdowns.get(item.id);
      if (!score) return [];
      return [
        {
          albumId: item.albumId,
          albumName: item.albumInfo?.name ?? "",
          matchingMoods: item.matchingMoods,
          score,
        },
      ];
    });

  const explain: RecommendationExplanation | undefined =
    candidateExplanations[0]
      ? {
          filters: {
            moods: requiredMoods,
            activity: normalizedActivity,
            format,
            tags: requiredTags,
          },
          counts: {
            collection: collection.length,
            afterFilters: recommendations.length,
          },
          weights: {
            recent: W_RECENT,
            feedback: W_FEEDBACK,
          },
          selected: candidateExplanations[0],
          alternatives: candidateExplanations.slice(1, 4),
        }
      : undefined;

  return { optimalMoods, recommendations, recommendedAlbum, explain };
}
