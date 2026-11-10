import { authFetch } from "@/lib/api/authFetch";
import { normalizeMoods } from "@/constants/moods";
import type { Album } from "@/types/album";
import type {
  CollectionAlbum,
  CollectionFormat,
  CollectionTag,
  SaveCollectionResponse,
} from "@/types/collection";

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
export async function getCollection(): Promise<CollectionAlbum[]> {
  const response = await authFetch("/api/collection");
  const data = await parseJson<{
    collection?: CollectionAlbum[];
    error?: string;
  }>(response);

  if (!response.ok) {
    throw new Error(data?.error || `Carga fallida (${response.status})`);
  }

  return data?.collection ?? [];
}

/** Guarda o actualiza un álbum en la colección. */
export async function saveCollectionAlbum(
  album: Album,
  feelings: (string | { label: string })[],
  format: CollectionFormat[] = ["digital"],
  activities: string[] = [],
  tags: CollectionTag[] = [],
): Promise<SaveCollectionResponse> {
  const normalizedFeelings = normalizeMoods(
    feelings.map((feeling) =>
      typeof feeling === "string" ? feeling : feeling.label,
    ),
  );

  const response = await authFetch("/api/collection", {
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

  const data = await parseJson<SaveCollectionResponse & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo guardar el álbum");
  }

  return data as SaveCollectionResponse;
}

/**
 * Elimina un álbum de la colección.
 *
 * `DELETE /api/collection` identifica el álbum por la query `albumId`, así que
 * el id viaja en la URL y no en el cuerpo de la petición.
 */
export async function removeCollectionAlbum(album: Album): Promise<void> {
  const response = await authFetch(
    `/api/collection?albumId=${encodeURIComponent(album.id)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    const data = await parseJson<{ error?: string }>(response);
    throw new Error(data?.error || "No se pudo eliminar el álbum");
  }
}
