import "server-only";

import { reportApiError } from "@/lib/sentry";
import {
  buildArtistAlbumQuery,
  filterArtistAlbums,
  findExactArtist,
  prioritizeExactArtist,
} from "@/utils/searchTerms";
import type { SpotifyAlbum, SpotifyArtist } from "@/types/album";
import type { ArtistRelease } from "@/types/artists";
import type {
  SpotifyArtistAlbum,
  SpotifyArtistAlbumsResponse,
  SpotifySearchResponse,
  SpotifyTokenResponse,
  SpotifyTrackPage,
} from "@/types/spotify-api";

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// Caché del token de aplicación: uno por instancia y por ventana de validez.
let cachedToken: { value: string; expiresAt: number } | null = null;
let tokenRequest: Promise<string> | null = null;

async function requestAccessToken(): Promise<string> {
  if (!client_id || !client_secret) {
    throw new Error(
      "Missing Spotify credentials (SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET)",
    );
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Spotify token error:", response.status, errorText);
    throw new Error(
      `Failed to get Spotify access token: ${response.status} - ${errorText}`,
    );
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  if (!data.access_token) {
    throw new Error("No access token in Spotify response");
  }

  const ttlMs = (Number(data.expires_in) || 3600) * 1000;
  cachedToken = {
    value: data.access_token,
    // Margen de 60 s antes de la caducidad real, con un mínimo de seguridad.
    expiresAt: Date.now() + Math.max(ttlMs - 60_000, 30_000),
  };

  return data.access_token;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  // Deduplica ráfagas concurrentes: todas esperan a la misma petición.
  if (!tokenRequest) {
    tokenRequest = requestAccessToken().finally(() => {
      tokenRequest = null;
    });
  }

  return tokenRequest;
}

export async function getArtist(id: string): Promise<SpotifyArtist> {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return (await res.json()) as SpotifyArtist;
}

export async function searchArtists(
  query: string,
): Promise<SpotifySearchResponse> {
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=12`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return (await res.json()) as SpotifySearchResponse;
}

/**
 * Discografía de un artista: solo álbumes y EPs.
 * Spotify agrupa los EPs bajo `single`, así que se pide `album,single` y se
 * conserva un single solo si tiene 3 o más pistas (heurística de EP).
 * Se excluyen compilaciones y apariciones en trabajos de otros.
 */
export async function getArtistAlbums(
  id: string,
): Promise<SpotifyArtistAlbum[]> {
  const token = await getAccessToken();
  const limit = 50;
  const items: SpotifyArtistAlbum[] = [];

  for (let page = 0; page < 4; page += 1) {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=${limit}&offset=${page * limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      if (page === 0) {
        throw new Error(`Spotify API error: ${res.status}`);
      }
      break;
    }

    const data = (await res.json()) as SpotifyArtistAlbumsResponse;
    items.push(...(data.items ?? []));
    if (!data.next) break;
  }

  const seen = new Set<string>();
  return items
    .filter((album) => {
      if (!album?.id || seen.has(album.id)) return false;
      seen.add(album.id);
      if (album.album_group === "appears_on") return false;
      if (album.album_type === "compilation") return false;
      if (album.album_type === "album") return true;
      if (album.album_type === "single") {
        return (album.total_tracks ?? 0) >= 3;
      }
      return false;
    })
    .sort((a, b) => (a.release_date < b.release_date ? 1 : -1));
}

/**
 * Novedades de un artista: álbumes, EPs y singles publicados en los últimos
 * `withinDays` días. A diferencia de la discografía, aquí sí se incluyen los
 * singles (un single nuevo es noticia). Excluye compilaciones y apariciones en
 * trabajos de otros, y descarta los lanzamientos sin precisión de mes/día.
 */
export async function getArtistReleases(
  id: string,
  withinDays = 60,
): Promise<ArtistRelease[]> {
  const token = await getAccessToken();
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;

  const res = await fetch(
    `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  const data = (await res.json()) as SpotifyArtistAlbumsResponse;
  const seen = new Set<string>();

  return (data.items ?? [])
    .filter((album) => {
      if (!album?.id || seen.has(album.id)) return false;
      seen.add(album.id);
      if (album.album_group === "appears_on") return false;
      if (album.album_type === "compilation") return false;
      if (album.album_type !== "album" && album.album_type !== "single") {
        return false;
      }
      if (album.release_date_precision === "year") return false;
      const releasedAt = new Date(album.release_date).getTime();
      if (Number.isNaN(releasedAt) || releasedAt < cutoff) return false;
      return true;
    })
    .map((album) => ({
      id: album.id,
      name: album.name,
      images: album.images ?? [],
      artists: (album.artists ?? []).map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      releaseDate: album.release_date,
      albumType: album.album_type,
      totalTracks: album.total_tracks ?? 0,
    }))
    .sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));
}

export async function getAlbum(id: string): Promise<SpotifyAlbum> {
  const token = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return (await res.json()) as SpotifyAlbum;
}

async function requestSpotifySearch(
  token: string,
  query: string,
  type: "album" | "artist" | "album,artist",
  limit: number,
): Promise<SpotifySearchResponse> {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return (await res.json()) as SpotifySearchResponse;
}

/**
 * Búsqueda combinada de álbumes y artistas. Si la consulta coincide exactamente
 * con un artista, se prioriza su discografía y se descartan las coincidencias
 * parciales de título y los recopilatorios. Un fallo al enriquecer la respuesta
 * se degrada a los resultados generales para no romper la búsqueda.
 */
export async function searchStuff(
  query: string,
): Promise<SpotifySearchResponse> {
  const token = await getAccessToken();
  const results = await requestSpotifySearch(token, query, "album,artist", 10);

  const exactArtist = findExactArtist(results.artists?.items, query);

  if (!exactArtist) {
    return results.artists
      ? {
          ...results,
          artists: {
            ...results.artists,
            items: prioritizeExactArtist(results.artists.items),
          },
        }
      : results;
  }

  const artists = prioritizeExactArtist(results.artists?.items, exactArtist.id);

  try {
    const artistSearch = await requestSpotifySearch(
      token,
      buildArtistAlbumQuery(exactArtist.name),
      "album",
      50,
    );
    const artistAlbums = filterArtistAlbums(
      artistSearch.albums?.items,
      exactArtist.id,
    );

    if (artistAlbums.length === 0) {
      return {
        ...results,
        artists: { ...results.artists, items: artists },
      };
    }

    return {
      ...results,
      artists: { ...results.artists, items: artists },
      albums: {
        ...results.albums,
        items: artistAlbums,
        next: null,
      },
    };
  } catch (error) {
    reportApiError(error, "search", "warning");
    return {
      ...results,
      artists: { ...results.artists, items: artists },
    };
  }
}

export async function getAlbumTracklist(
  albumId: string,
): Promise<SpotifyTrackPage> {
  const token = await getAccessToken();

  const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("❌ Spotify API error response:", errorBody);
    throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as SpotifyTrackPage;
}
