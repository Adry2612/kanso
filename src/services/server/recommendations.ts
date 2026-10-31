import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { normalizeMood } from "@/constants/moods";
import { listCollection } from "@/services/server/collection";
import {
  computeActivityRecommendations,
  feedbackBoostFor,
  matchesCollectionFormat,
  matchesRecommendationTags,
  overlapRatio,
  recencyPenalty,
  scoreCandidateBreakdown,
  W_FEEDBACK,
  W_RECENT,
  RECENT_WINDOW,
} from "@/utils/recommendations";
import type {
  ActivityCollectionRecord,
  ActivityRecommendationsResult,
  MoodRecommendationResponse,
  RecommendationCandidateExplanation,
  RecommendationExplanation,
  RecommendationHistoryResponse,
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

export type MoodRecommendationInput = {
  moods?: unknown;
  format?: unknown;
  tags?: unknown;
};

export type SaveRecommendationHistoryInput = {
  albumId?: unknown;
  moods?: unknown;
};

export type RateRecommendationInput = {
  albumId?: unknown;
  liked?: unknown;
};

/** Últimos álbumes recomendados, de la recomendación más reciente a la más antigua. */
async function recentRecommendationAlbumIds(uid: string): Promise<string[]> {
  const snapshot = await adminDb()
    .collection(`users/${uid}/recomendationHistory`)
    .orderBy("providedAt", "desc")
    .limit(RECENT_WINDOW)
    .get();

  return snapshot.docs
    .map((doc) => doc.data().albumId)
    .filter(
      (albumId): albumId is string =>
        typeof albumId === "string" && albumId.length > 0,
    );
}

/** Valoraciones guardadas por álbum. */
async function loadFeedback(
  uid: string,
): Promise<Map<string, { liked: boolean; topMoods: string[] }>> {
  const snapshot = await adminDb()
    .collection(`users/${uid}/recommendationFeedback`)
    .get();

  const feedback = new Map<string, { liked: boolean; topMoods: string[] }>();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (typeof data.liked !== "boolean") continue;

    const albumId = typeof data.albumId === "string" ? data.albumId : doc.id;
    feedback.set(albumId, {
      liked: data.liked,
      topMoods: Array.isArray(data.topMoods)
        ? data.topMoods.filter(
            (mood: unknown): mood is string => typeof mood === "string",
          )
        : [],
    });
  }

  return feedback;
}

/** Registros de la colección en la forma que espera el cálculo por actividad. */
async function collectionRecords(uid: string): Promise<{
  records: ActivityCollectionRecord[];
  albums: Map<string, RecommendedAlbumInfo>;
}> {
  const collection = await listCollection(uid);
  const albums = new Map<string, RecommendedAlbumInfo>();

  const records = collection.flatMap<ActivityCollectionRecord>((entry) => {
    if (!entry.albumId || !entry.album) return [];
    albums.set(entry.albumId, entry.album as unknown as RecommendedAlbumInfo);
    return [
      {
        id: entry.id,
        albumId: entry.albumId,
        format: entry.format,
        tags: entry.tags as { category?: string; value?: string }[] | undefined,
        labeledFeelings: entry.labeledFeelings,
        activities: Array.isArray(entry.activities)
          ? entry.activities.filter(
              (activity): activity is string => typeof activity === "string",
            )
          : undefined,
      },
    ];
  });

  return { records, albums };
}

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

  const { records, albums } = await collectionRecords(uid);

  const [recentAlbumIds, feedbackByAlbum] = await Promise.all([
    recentRecommendationAlbumIds(uid),
    loadFeedback(uid),
  ]);

  return computeActivityRecommendations({
    collection: records,
    activity,
    format: typeof format === "string" ? format : "all",
    requiredMoods: Array.isArray(requiredMoods)
      ? (requiredMoods as string[])
      : [],
    requiredTags: Array.isArray(requiredTags) ? (requiredTags as string[]) : [],
    recentAlbumIds,
    feedbackByAlbum,
    getAlbum: async (albumId) => albums.get(albumId),
  });
}

type MoodCandidateEntry = {
  id: string;
  albumId: string;
  album: Record<string, unknown>;
  format?: string | string[];
  tags?: { category?: string; value?: string }[];
  labeledFeelings?: unknown[];
  activities?: unknown;
};

/** Recomendación ponderada por emociones, con filtros de formato y etiquetas. */
export async function recommendByMood(
  uid: string,
  input: MoodRecommendationInput,
): Promise<MoodRecommendationResponse> {
  const { moods, format = "all", tags = [] } = input;
  const moodList = [
    ...new Set(
      (Array.isArray(moods) ? moods : [])
        .filter((mood): mood is string => typeof mood === "string")
        .map((mood) => normalizeMood(mood) ?? mood),
    ),
  ];
  const tagList = Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  const selectedFormat = typeof format === "string" ? format : "all";
  // La recomendación rápida no pide emoción: en ese caso compiten todos los
  // álbumes que pasan formato y etiquetas. Solo se exige coincidencia cuando
  // hay emociones seleccionadas.
  const requiresMoodMatch = moodList.length > 0;

  const collection = await listCollection(uid);
  const collectionEntries = collection.flatMap<MoodCandidateEntry>((entry) => {
    if (!entry.albumId || !entry.album) return [];
    return [
      {
        id: entry.id,
        albumId: entry.albumId,
        album: entry.album,
        format: entry.format,
        tags: entry.tags as MoodCandidateEntry["tags"],
        labeledFeelings: entry.labeledFeelings,
        activities: entry.activities,
      },
    ];
  });

  const baseFiltered = collectionEntries.filter(
    (entry) =>
      matchesCollectionFormat(entry.format, selectedFormat) &&
      matchesRecommendationTags(entry.tags, tagList),
  );

  const [recentAlbumIds, feedbackByAlbum] = await Promise.all([
    recentRecommendationAlbumIds(uid),
    loadFeedback(uid),
  ]);

  const candidates = baseFiltered.flatMap((entry) => {
    const albumId = entry.albumId;
    const feelings = [
      ...new Set(
        (entry.labeledFeelings ?? [])
          .filter((feeling): feeling is string => typeof feeling === "string")
          .map((feeling) => normalizeMood(feeling) ?? feeling),
      ),
    ];
    const matchingMoods = feelings.filter((mood) => moodList.includes(mood));
    const labelOverlap =
      moodList.length > 0 ? overlapRatio(feelings, moodList) : 0;

    if (requiresMoodMatch && labelOverlap === 0) return [];

    return [
      {
        entry,
        albumId,
        feelings,
        matchingMoods,
        breakdown: scoreCandidateBreakdown({
          labelOverlap,
          recencyPenalty: recencyPenalty(albumId, recentAlbumIds),
          feedbackBoost: feedbackBoostFor(albumId, feelings, feedbackByAlbum),
        }),
      },
    ];
  });

  if (candidates.length === 0) {
    throw new RecommendationApiError(404, "No se encontraron álbumes");
  }

  candidates.sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore);
  const top = candidates.slice(0, Math.min(3, candidates.length));
  const selected = top[Math.floor(Math.random() * top.length)];

  const toExplanation = (
    candidate: (typeof candidates)[number],
  ): RecommendationCandidateExplanation => ({
    albumId: candidate.albumId,
    albumName: (candidate.entry.album as { name?: string } | null)?.name ?? "",
    matchingMoods: candidate.matchingMoods,
    score: candidate.breakdown,
  });

  const explain: RecommendationExplanation = {
    filters: {
      moods: moodList,
      activity: null,
      format: selectedFormat,
      tags: tagList,
    },
    counts: {
      collection: collectionEntries.length,
      afterFilters: candidates.length,
    },
    weights: {
      recent: W_RECENT,
      feedback: W_FEEDBACK,
    },
    selected: toExplanation(selected),
    alternatives: candidates
      .filter((candidate) => candidate !== selected)
      .slice(0, 3)
      .map(toExplanation),
  };

  return {
    id: selected.entry.id,
    albumId: selected.albumId,
    format: selected.entry.format,
    tags: selected.entry.tags,
    labeledFeelings: selected.feelings,
    activities: Array.isArray(selected.entry.activities)
      ? selected.entry.activities.filter(
          (activity): activity is string => typeof activity === "string",
        )
      : [],
    albumInfo: selected.entry.album as unknown as RecommendedAlbumInfo,
    explain,
  };
}

/** Historial completo de recomendaciones, de la más reciente a la más antigua. */
export async function listRecommendationHistory(
  uid: string,
): Promise<RecommendationHistoryResponse> {
  const db = adminDb();
  const historySnapshot = await db
    .collection(`users/${uid}/recomendationHistory`)
    .orderBy("providedAt", "desc")
    .get();

  if (historySnapshot.empty) return { history: [] };

  const history = await Promise.all(
    historySnapshot.docs.map(async (historyDoc) => {
      const { albumId, moods, providedAt } = historyDoc.data();
      const albumSnap =
        typeof albumId === "string"
          ? await db.doc(`albums/${albumId}`).get()
          : null;

      return {
        id: historyDoc.id,
        albumId,
        moods: moods || [],
        providedAt: providedAt?.toDate?.()?.toISOString() || providedAt,
        album: albumSnap?.exists ? albumSnap.data() : null,
      };
    }),
  );

  return { history: history as RecommendationHistoryResponse["history"] };
}

/** Guarda la recomendación mostrada en el historial de la persona. */
export async function saveRecommendationHistory(
  uid: string,
  input: SaveRecommendationHistoryInput,
): Promise<{ success: true; recommendationId: string }> {
  const { albumId, moods } = input;

  if (typeof albumId !== "string" || !albumId.trim()) {
    throw new RecommendationApiError(400, "Falta el álbum de la recomendación");
  }

  const docRef = await adminDb()
    .collection(`users/${uid}/recomendationHistory`)
    .add({
      albumId,
      moods: Array.isArray(moods) ? moods : [],
      providedAt: FieldValue.serverTimestamp(),
    });

  return { success: true, recommendationId: docRef.id };
}

/** Guarda (o sustituye) la valoración de una recomendación. */
export async function rateRecommendation(
  uid: string,
  input: RateRecommendationInput,
): Promise<{
  success: true;
  albumId: string;
  liked: boolean;
  topMoods: string[];
}> {
  const { albumId, liked } = input;

  if (typeof albumId !== "string" || !albumId.trim()) {
    throw new RecommendationApiError(400, "Falta el álbum de la recomendación");
  }
  if (typeof liked !== "boolean") {
    throw new RecommendationApiError(400, "Valoración no válida");
  }

  const collection = await listCollection(uid);
  const entry = collection.find(
    (item) => (item.albumId ?? item.id) === albumId,
  );

  if (!entry) {
    throw new RecommendationApiError(404, "El álbum no está en tu colección");
  }

  const topMoods = [
    ...new Set(
      (entry.labeledFeelings ?? [])
        .filter((feeling): feeling is string => typeof feeling === "string")
        .map((feeling) => normalizeMood(feeling) ?? feeling),
    ),
  ].slice(0, 3);

  await adminDb().doc(`users/${uid}/recommendationFeedback/${albumId}`).set({
    albumId,
    liked,
    topMoods,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true, albumId, liked, topMoods };
}

/** Valoración guardada de un álbum, si existe. */
export async function getRecommendationFeedback(
  uid: string,
  albumId: unknown,
): Promise<{ albumId: string; liked: boolean } | null> {
  if (typeof albumId !== "string" || !albumId.trim()) {
    throw new RecommendationApiError(400, "Falta el álbum de la recomendación");
  }

  const snapshot = await adminDb()
    .doc(`users/${uid}/recommendationFeedback/${albumId}`)
    .get();

  if (!snapshot.exists) return null;

  const liked = snapshot.data()?.liked;
  return typeof liked === "boolean" ? { albumId, liked } : null;
}
