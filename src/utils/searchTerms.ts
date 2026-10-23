import type { SpotifyAlbum, SpotifyArtist } from "@/types/album";

/** Normaliza el término de búsqueda que se registra en la comunidad. */
export function normalizeCommunityTerm(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 60);
}

/**
 * Normaliza un nombre de artista para compararlo con la consulta: sin tildes,
 * sin mayúsculas y con los espacios colapsados.
 */
export function normalizeArtistName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Devuelve el primer artista cuyo nombre coincide exactamente con la consulta. */
export function findExactArtist(
  artists: readonly SpotifyArtist[] | undefined,
  query: string,
): SpotifyArtist | undefined {
  const normalizedQuery = normalizeArtistName(query);
  if (!normalizedQuery) return undefined;

  return artists?.find(
    (artist) => normalizeArtistName(artist.name) === normalizedQuery,
  );
}

/** Construye una consulta de Spotify segura para buscar álbumes de un artista. */
export function buildArtistAlbumQuery(name: string): string {
  const escaped = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `artist:"${escaped}"`;
}

/** Conserva solo los álbumes del artista, sin recopilatorios ni duplicados. */
export function filterArtistAlbums(
  albums: readonly SpotifyAlbum[] | undefined,
  artistId: string,
  limit = 12,
): SpotifyAlbum[] {
  if (!albums?.length) return [];

  const seen = new Set<string>();
  const result: SpotifyAlbum[] = [];

  for (const album of albums) {
    if (!album?.id || seen.has(album.id)) continue;
    if (album.album_type === "compilation") continue;
    if (!album.artists?.some((artist) => artist.id === artistId)) continue;

    seen.add(album.id);
    result.push(album);

    if (result.length >= limit) break;
  }

  return result;
}

/** Coloca al artista exacto primero y elimina duplicados por id. */
export function prioritizeExactArtist(
  artists: readonly SpotifyArtist[] | undefined,
  exactArtistId?: string,
): SpotifyArtist[] {
  if (!artists?.length) return [];

  const seen = new Set<string>();
  const result: SpotifyArtist[] = [];
  const exact = exactArtistId
    ? artists.find((artist) => artist.id === exactArtistId)
    : undefined;

  if (exact) {
    seen.add(exact.id);
    result.push(exact);
  }

  for (const artist of artists) {
    if (!artist?.id || seen.has(artist.id)) continue;
    seen.add(artist.id);
    result.push(artist);
  }

  return result;
}

/** Indica si el término nuevo sustituye a un prefijo anterior. */
export function extendsPreviousTerm(
  previous: string | null,
  next: string,
): boolean {
  return previous !== null && next.startsWith(previous);
}
