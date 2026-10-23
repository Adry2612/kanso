import type { SpotifyAlbum, Track } from "@/types/album";

/** Obtiene el detalle de un álbum a través de la API interna. */
export async function getAlbum(albumId: string): Promise<SpotifyAlbum> {
  const response = await fetch(`/api/albums/${encodeURIComponent(albumId)}`);

  if (!response.ok) {
    throw new Error("No se pudo cargar el álbum");
  }

  return (await response.json()) as SpotifyAlbum;
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
