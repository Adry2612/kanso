// ==========================================
// 1. FUNCIONES BASE / API CALLS EXISTENTES
// ==========================================

import { authFetch } from "@/lib/api/authFetch";
import type { ActivityRecommendationsResult } from "@/lib/activityRecommendations";

// La identidad viaja en el token de la sesión; la API deriva el usuario de él.

export const getRecomendation = async (
  moods: string[],
  format = "all",
  tags: string[] = [],
) => {
  const res = await authFetch("/api/getAlbumsByMood", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moods, format, tags }),
  });

  // 404 significa "sin coincidencias": no es un error técnico, es un estado
  // vacío accionable. Devolvemos null para que la vista lo distinga.
  if (res.status === 404) return null;

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error || "Error al obtener la recomendación.");

  return data;
};

export const saveRecomendationHistory = async (
  moods: string[],
  albumFirebaseId: string,
) => {
  const res = await authFetch("/api/saveRecomendationHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moods, albumId: albumFirebaseId }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error || "Error al guardar la recomendación.");

  return data;
};

export const getRecomendationHistory = async () => {
  const res = await authFetch("/api/getRecomendationHistory");

  const data = await res.json();

  if (!res.ok)
    throw new Error(
      data.error || "Error al obtener el historial de recomendaciones.",
    );

  return data;
};

/**
 * Recomendación por actividad. La lógica vive en el servidor (necesita leer la
 * colección del usuario), así que el cliente no toca Firestore.
 */
export const getRecommendedAlbumByActivity = async (
  activity: string,
  format = "all",
  requiredMoods: string[] = [],
  requiredTags: string[] = [],
): Promise<ActivityRecommendationsResult> => {
  const res = await authFetch("/api/getRecommendedAlbumByActivity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, format, requiredMoods, requiredTags }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error || "Error al obtener la recomendación.");

  return data as ActivityRecommendationsResult;
};
