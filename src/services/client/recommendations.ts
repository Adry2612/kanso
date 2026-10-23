"use client";

import { authFetch } from "@/lib/api/authFetch";
import type {
  ActivityRecommendationsResult,
  MoodRecommendationResponse,
  RecommendationHistoryResponse,
} from "@/types/recommendations";

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Recomendación por emoción. Un 404 significa «sin coincidencias», no un
 * fallo técnico: devolvemos null para que la vista muestre su estado vacío.
 */
export async function getRecommendation(
  moods: string[],
  format = "all",
  tags: string[] = [],
): Promise<MoodRecommendationResponse | null> {
  const response = await authFetch("/api/getAlbumsByMood", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moods, format, tags }),
  });

  if (response.status === 404) return null;

  const data = await parseJson<MoodRecommendationResponse & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data?.error || "Error al obtener la recomendación.");
  }

  return data;
}

/** Guarda la recomendación mostrada en el historial de la persona. */
export async function saveRecommendationHistory(
  moods: string[],
  albumFirebaseId: string,
): Promise<{ message?: string }> {
  const response = await authFetch("/api/saveRecomendationHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moods, albumId: albumFirebaseId }),
  });

  const data = await parseJson<{ message?: string; error?: string }>(response);

  if (!response.ok) {
    throw new Error(data?.error || "Error al guardar la recomendación.");
  }

  return data ?? {};
}

/** Historial completo de recomendaciones, más reciente primero. */
export async function getRecommendationHistory(): Promise<RecommendationHistoryResponse> {
  const response = await authFetch("/api/getRecomendationHistory");
  const data = await parseJson<
    RecommendationHistoryResponse & { error?: string }
  >(response);

  if (!response.ok) {
    throw new Error(
      data?.error || "Error al obtener el historial de recomendaciones.",
    );
  }

  return { history: data?.history ?? [] };
}

/**
 * Recomendación por actividad. La lógica vive en el servidor (necesita leer la
 * colección de la persona), así que el cliente no toca Firestore.
 */
export async function getRecommendedAlbumByActivity(
  activity: string,
  format = "all",
  requiredMoods: string[] = [],
  requiredTags: string[] = [],
): Promise<ActivityRecommendationsResult> {
  const response = await authFetch("/api/getRecommendedAlbumByActivity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, format, requiredMoods, requiredTags }),
  });

  const data = await parseJson<
    ActivityRecommendationsResult & { error?: string }
  >(response);

  if (!response.ok || !data) {
    throw new Error(data?.error || "Error al obtener la recomendación.");
  }

  return data;
}
