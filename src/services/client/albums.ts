import { authFetch } from "@/lib/api/authFetch";
import { isGenreKey } from "@/constants/taxonomy";
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

export type AlbumGenreProfile = {
  main: GenreBranch | null;
  branches: GenreBranch[];
};

const EMPTY_GENRE_PROFILE: AlbumGenreProfile = { main: null, branches: [] };

/** Perfil de género derivado de los artistas del álbum. */
export async function getAlbumGenre(
  albumId: string,
): Promise<AlbumGenreProfile> {
  const response = await authFetch(
    `/api/albumGenres?albumId=${encodeURIComponent(albumId)}`,
  );

  if (!response.ok) return EMPTY_GENRE_PROFILE;

  const data = (await response.json().catch(() => null)) as {
    main?: unknown;
    branches?: unknown;
  } | null;

  const branches = Array.isArray(data?.branches)
    ? data.branches.filter(
        (genre): genre is GenreBranch =>
          typeof genre === "string" && isGenreKey(genre),
      )
    : [];

  const main =
    typeof data?.main === "string" && isGenreKey(data.main) ? data.main : null;

  return { main, branches };
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
