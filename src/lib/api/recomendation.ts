// ==========================================
// 1. FUNCIONES BASE / API CALLS EXISTENTES
// ==========================================

export const getRecomendation = async (
  moods: string[],
  userId: string,
  format = "all",
  tags: string[] = [],
) => {
  const res = await fetch("/api/getAlbumsByMood", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moods, userId, format, tags }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error || "Error al obtener la recomendación.");

  return data;
};

export const saveRecomendationHistory = async (
  moods: string[],
  albumFirebaseId: string,
  userId: string,
) => {
  const res = await fetch("/api/saveRecomendationHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moods, albumId: albumFirebaseId, userId }),
  });

  const data = await res.json();

  if (!res.ok)
    throw new Error(data.error || "Error al guardar la recomendación.");

  return data;
};

export const getRecomendationHistory = async (userId: string) => {
  const res = await fetch(
    `/api/getRecomendationHistory?userId=${encodeURIComponent(userId)}`,
  );

  const data = await res.json();

  if (!res.ok)
    throw new Error(
      data.error || "Error al obtener el historial de recomendaciones.",
    );

  return data;
};
