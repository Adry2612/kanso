// src/lib/api/favorites.ts
import { User } from "firebase/auth";
import { Album } from "../../../models/album";
import {
  FavoriteFormat,
  FavoriteTag,
  SaveFavoriteResponse,
} from "@/types/favorites";
import { normalizeMoods } from "@/constants/moods";

export const addFavorite = async (
  album: Album,
  user: User,
  feelings: string[],
  format: FavoriteFormat[] = ["digital"],
  activities: string[] = [],
  tags: FavoriteTag[] = [],
): Promise<SaveFavoriteResponse> => {
  if (!user?.uid) throw new Error("Usuario no autenticado");

  const normalizedFeelings = normalizeMoods(
    feelings.map((feeling: any) =>
      typeof feeling === "string" ? feeling : feeling.label,
    ),
  );

  const res = await fetch("/api/toggleFavorite/", {
    method: "POST",
    body: JSON.stringify({
      album,
      userId: user.uid,
      feelings: normalizedFeelings,
      format,
      activities,
      tags,
    }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "Error al guardar favorito");

  return data as SaveFavoriteResponse;
};

export const undoFavorite = async (album: Album, userId: string) => {
  const res = await fetch("/api/removeFavorite/", {
    method: "DELETE",
    body: JSON.stringify({ album, userId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Error al guardar");
  }
};
