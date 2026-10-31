import "server-only";

import { mapSpotifyGenres, type GenreBranch } from "@/utils/genres";
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

/**
 * Deriva las ramas principales de género de un álbum a partir de los géneros
 * de sus artistas. Si Spotify falla para algún artista, se ignora; si fallan
 * todos, devuelve `[]` sin romper el guardado.
 */
export async function deriveAlbumGenreBranches(album: {
  artists?: { id?: string }[];
}): Promise<GenreBranch[]> {
  const artistIds = [
    ...new Set(
      (album.artists ?? [])
        .map((artist) => artist.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  ];

  if (artistIds.length === 0) return [];

  const results = await Promise.allSettled(
    artistIds.map((artistId) => artistGenres(artistId)),
  );

  const genres = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return mapSpotifyGenres(genres);
}
