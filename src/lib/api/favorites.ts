import type { User } from "firebase/auth";
import type { Album } from "@/types/album";
import type {
  FavoriteFormat,
  FavoriteTag,
  SaveFavoriteResponse,
} from "@/types/favorites";
import {
  addFavorite as saveFavorite,
  removeFavorite,
} from "@/services/client/favorites";

export { getCollection, removeFavorite } from "@/services/client/favorites";

/** Compatibilidad con la firma anterior; el usuario se deriva del token. */
export const addFavorite = async (
  album: Album,
  user: User,
  feelings: (string | { label: string })[],
  format: FavoriteFormat[] = ["digital"],
  activities: string[] = [],
  tags: FavoriteTag[] = [],
): Promise<SaveFavoriteResponse> => {
  if (!user?.uid) throw new Error("Usuario no autenticado");
  return saveFavorite(album, feelings, format, activities, tags);
};

export const undoFavorite = async (album: Album) => removeFavorite(album);
