import { authFetch } from "@/lib/api/authFetch";
import type { SpotifyAlbum, Track } from "@/types/album";
import type { GenreBranch } from "@/utils/genres";

/** Obtiene el detalle de un álbum a través de la API interna. */
export async function getAlbum(albumId: string): Promise<SpotifyAlbum> {
  const response = await fetch(`/api/albums/${encodeURIComponent(albumId)}`);

  if (!response.ok) {
    throw new Error("No se pudo cargar el álbum");
  }

  return (await response.json()) as SpotifyAlbum;
}

/** Ramas de género derivadas de los artistas del álbum. */
export async function getAlbumGenres(albumId: string): Promise<GenreBranch[]> {
  const response = await authFetch(
    `/api/albumGenres?albumId=${encodeURIComponent(albumId)}`,
  );

  if (!response.ok) return [];

  const data = (await response.json().catch(() => null)) as {
    genres?: GenreBranch[];
  } | null;

  return Array.isArray(data?.genres) ? data.genres : [];
}

/** Obtiene la tracklist de un álbum de la colección. */
export async function getAlbumTracklist(albumId: string): Promise<Track[]> {
  const response = await fetch(
    `/api/getAlbumTracklist?id=${encodeURIComponent(albumId)}`,
  );

  if (!response.ok) {
    throw new Error("No se pudo cargar la tracklist");
  }

  return (await response.json()) as Track[];
}
