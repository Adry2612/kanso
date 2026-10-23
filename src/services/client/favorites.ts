import { authFetch } from "@/lib/api/authFetch";
import { normalizeMoods } from "@/constants/moods";
import type { Album } from "@/types/album";
import type {
  CollectionFavorite,
  FavoriteFormat,
  FavoriteTag,
  SaveFavoriteResponse,
} from "@/types/favorites";

async function parseJson<T = { error?: string }>(
  response: Response,
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Carga la colección de la persona autenticada. */
export async function getCollection(): Promise<CollectionFavorite[]> {
  const response = await authFetch("/api/userFavorites");
  const data = await parseJson<{
    favorites?: CollectionFavorite[];
    error?: string;
  }>(response);

  if (!response.ok) {
    throw new Error(data?.error || `Carga fallida (${response.status})`);
  }

  return data?.favorites ?? [];
}

/** Guarda o actualiza un álbum en la colección. */
export async function addFavorite(
  album: Album,
  feelings: (string | { label: string })[],
  format: FavoriteFormat[] = ["digital"],
  activities: string[] = [],
  tags: FavoriteTag[] = [],
): Promise<SaveFavoriteResponse> {
  const normalizedFeelings = normalizeMoods(
    feelings.map((feeling) =>
      typeof feeling === "string" ? feeling : feeling.label,
    ),
  );

  const response = await authFetch("/api/toggleFavorite", {
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

  const data = await parseJson<SaveFavoriteResponse & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo guardar el álbum");
  }

  return data as SaveFavoriteResponse;
}

/** Elimina un álbum de la colección. */
export async function removeFavorite(album: Album): Promise<void> {
  const response = await authFetch("/api/removeFavorite", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album }),
  });

  if (!response.ok) {
    const data = await parseJson<{ error?: string }>(response);
    throw new Error(data?.error || "No se pudo eliminar el álbum");
  }
}
