import "server-only";

import {
  mapSpotifyGenres,
  pickMainGenre,
  type GenreBranch,
} from "@/utils/genres";
import { getArtist } from "./spotify";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const artistGenreCache = new Map<string, { genres: string[]; at: number }>();

async function artistGenres(artistId: string): Promise<string[]> {
  const cached = artistGenreCache.get(artistId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.genres;
  }

  let genres: string[] = [];
  try {
    const artist = await getArtist(artistId);
    genres = Array.isArray(artist.genres)
      ? artist.genres.filter(
          (genre): genre is string => typeof genre === "string",
        )
      : [];
  } catch {
    genres = [];
  }

  artistGenreCache.set(artistId, { genres, at: Date.now() });
  return genres;
}

export type AlbumGenreProfile = {
  /** Rama principal; `null` si Spotify no aportó géneros. */
  main: GenreBranch | null;
  /** Todas las ramas reconocidas, en orden canónico. */
  branches: GenreBranch[];
};

/**
 * Deriva el perfil de género de un álbum a partir de los géneros de sus
 * artistas. Si Spotify falla para algún artista, se ignora; si fallan todos,
 * devuelve un perfil vacío sin romper el guardado.
 */
export async function deriveAlbumGenreProfile(album: {
  artists?: { id?: string }[];
}): Promise<AlbumGenreProfile> {
  const artistIds = [
    ...new Set(
      (album.artists ?? [])
        .map((artist) => artist.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  if (artistIds.length === 0) return { main: null, branches: [] };

  const results = await Promise.allSettled(
    artistIds.map((artistId) => artistGenres(artistId)),
  );

  const perArtist = results.map((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const genres = perArtist.flat();

  return {
    main: pickMainGenre(perArtist),
    branches: mapSpotifyGenres(genres),
  };
}

/** Ramas reconocidas de un álbum, sin elegir una principal. */
export async function deriveAlbumGenreBranches(album: {
  artists?: { id?: string }[];
}): Promise<GenreBranch[]> {
  return (await deriveAlbumGenreProfile(album)).branches;
}
