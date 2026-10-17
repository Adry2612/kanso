// src/lib/api/favorites.ts
import { User } from "firebase/auth";
import { Album } from "../../../models/album";
import {
  FavoriteFormat,
  FavoriteTag,
  SaveFavoriteResponse,
} from "@/types/favorites";
import { normalizeMoods } from "@/constants/moods";
import { authFetch } from "@/lib/api/authFetch";

// Lee el cuerpo sin asumir que sea JSON: un error de proxy/HTML no debe
// convertirse en un SyntaxError críptico.
async function parseJson<T = { error?: string }>(
  res: Response,
): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const addFavorite = async (
  album: Album,
  user: User,
  feelings: (string | { label: string })[],
  format: FavoriteFormat[] = ["digital"],
  activities: string[] = [],
  tags: FavoriteTag[] = [],
): Promise<SaveFavoriteResponse> => {
  if (!user?.uid) throw new Error("Usuario no autenticado");

  const normalizedFeelings = normalizeMoods(
    feelings.map((feeling) =>
      typeof feeling === "string" ? feeling : feeling.label,
    ),
  );

  // El usuario se identifica con el token de la sesión: la API lo ignora del cuerpo.
  const res = await authFetch("/api/toggleFavorite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      album,
      feelings: normalizedFeelings,
      format,
      activities,
      tags,
    }),
  });

  const data = await parseJson<SaveFavoriteResponse & { error?: string }>(res);

  if (!res.ok) throw new Error(data?.error || "No se pudo guardar el álbum");

  return data as SaveFavoriteResponse;
};

export const undoFavorite = async (album: Album) => {
  const res = await authFetch("/api/removeFavorite", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album }),
  });

  if (!res.ok) {
    const data = await parseJson(res);
    throw new Error(data?.error || "No se pudo eliminar el álbum");
  }
};
