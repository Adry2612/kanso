/**
 * Recomendaciones por actividad en cliente (sin endpoint)
 */

import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { musicalFeelings } from "@/constants/feelings";
import type { ActivityRecommendation } from "@/types/favorites";
import { getMood, normalizeMood } from "@/constants/moods";

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

export type MoodTranslator = (key: string) => string;
export type ActivityTranslator = (key: string) => string;

export type FeelingTag = { label: string; emoji: string };

export type RecommendedAlbum = {
  feelings: FeelingTag[];
  albumId: string;
  labeledFeelings: string[];
  albumInfo: any;
};

export type ActivityRecommendationsResult = {
  optimalMoods: string[];
  recommendations: ActivityRecommendation[];
  recommendedAlbum: RecommendedAlbum | null;
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

function localizeMoodLabel(label: string, translateMood?: MoodTranslator) {
  if (!translateMood) return label;
  const key = moodLabelToKey[label];
  return key ? translateMood(key) : label;
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

export async function getRecommendedAlbumByActivity(
  userId: string,
  activity: string,
  translateMood?: MoodTranslator,
  translateActivity?: ActivityTranslator,
  format = "all",
  requiredMoods: string[] = [],
  requiredTags: string[] = [],
): Promise<ActivityRecommendationsResult> {
  const normalizedActivity = resolveActivityKey(activity, translateActivity);
  const optimalMoods = getMoodsForActivity(normalizedActivity);

  if (optimalMoods.length === 0) {
    return { optimalMoods, recommendations: [], recommendedAlbum: null };
  }

  const favoritesCollection = collection(db, "users", userId, "favorites");
  const favSnap = await getDocs(favoritesCollection);

  if (favSnap.empty) {
    return { optimalMoods, recommendations: [], recommendedAlbum: null };
  }

  const recommendations: ActivityRecommendation[] = [];

  for (const favDoc of favSnap.docs) {
    const favorite = favDoc.data();
    if (
      format !== "all" &&
      !(Array.isArray(favorite.format)
        ? favorite.format.includes(format)
        : favorite.format === format) &&
      !(Array.isArray(favorite.ownership?.format)
        ? favorite.ownership.format.includes(format)
        : favorite.ownership?.format === format)
    ) {
      continue;
    }
    if (
      requiredTags.length > 0 &&
      !requiredTags.some((tag) =>
        favorite.tags?.some(
          (favoriteTag: { category: string; value: string }) =>
            `${favoriteTag.category}:${favoriteTag.value}` === tag,
        ),
      )
    ) {
      continue;
    }
    const labeledFeelings = favorite.labeledFeelings || favorite.feelings || [];
    const normalizedFeelings = labeledFeelings
      .map((label: unknown) => normalizeMoodLabel(label))
      .filter((label: string) => label.length > 0);

    if (normalizedFeelings.length === 0) {
      continue;
    }

    const matchingMoods = normalizedFeelings.filter((mood: string) =>
      optimalMoods.includes(mood),
    );

    if (
      requiredMoods.length > 0 &&
      !requiredMoods.some((mood) => normalizedFeelings.includes(mood))
    ) {
      continue;
    }

    if (matchingMoods.length > 0) {
      const albumRef = doc(db, "albums", favorite.albumId);
      const albumSnap = await getDoc(albumRef);
      const albumInfo = albumSnap.exists() ? albumSnap.data() : null;

      recommendations.push({
        id: favDoc.id,
        albumId: favorite.albumId,
        labeledFeelings: normalizedFeelings,
        matchingMoods,
        compatibilityScore: matchingMoods.length / optimalMoods.length,
        albumInfo,
      });
    }
  }

  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  const best = recommendations[0];
  const recommendedAlbum = best
    ? {
        feelings: buildFeelingTags(
          best.matchingMoods.length > 0
            ? best.matchingMoods
            : best.labeledFeelings,
          translateMood,
        ),
        albumId: best.albumId,
        labeledFeelings: best.labeledFeelings,
        albumInfo: best.albumInfo,
      }
    : null;

  return { optimalMoods, recommendations, recommendedAlbum };
}
