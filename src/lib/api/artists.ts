import { authFetch } from "@/lib/api/authFetch";

export type ArtistLite = {
  id: string;
  name: string;
  images?: { url: string }[];
  genres?: string[];
  followers?: { total: number } | null;
};

export type ArtistAlbumLite = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  release_date?: string;
  total_tracks?: number;
  album_type?: string;
};

export const searchArtists = async (query: string): Promise<ArtistLite[]> => {
  const res = await fetch(`/api/searchArtists?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Error al buscar artistas");
  const data = await res.json();
  return data.artists?.items ?? [];
};

export const getArtistInfo = async (
  artistId: string,
): Promise<ArtistLite | null> => {
  const res = await fetch(`/api/getArtist?id=${encodeURIComponent(artistId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.id ? (data as ArtistLite) : null;
};

export const getArtistAlbums = async (
  artistId: string,
): Promise<ArtistAlbumLite[]> => {
  const res = await fetch(
    `/api/getArtistAlbums?id=${encodeURIComponent(artistId)}`,
  );
  if (!res.ok) throw new Error("Error al obtener la discografía");
  const data = await res.json();
  return data.albums ?? [];
};

// La identidad viaja en el token de la sesión; la API deriva el usuario de él.
export const getUserArtists = async (): Promise<ArtistLite[]> => {
  const res = await authFetch("/api/userArtists");
  if (!res.ok) throw new Error("Error al cargar tus artistas");
  const data = await res.json();
  return data.artists ?? [];
};

export type ArtistRelease = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { id?: string; name: string }[];
  releaseDate: string;
  albumType: string;
  totalTracks: number;
};

export const getArtistReleases = async (): Promise<ArtistRelease[]> => {
  const res = await authFetch("/api/artistReleases");
  if (!res.ok) throw new Error("Error al cargar las novedades");
  const data = await res.json();
  return data.releases ?? [];
};

export const toggleArtistFavorite = async (
  artist: ArtistLite,
): Promise<boolean> => {
  const res = await authFetch("/api/toggleArtistFavorite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist }),
  });
  if (!res.ok) throw new Error("Error al actualizar el artista favorito");
  const data = await res.json();
  return Boolean(data.favorite);
};
