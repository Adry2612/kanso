import { authFetch } from "@/lib/api/authFetch";
import type {
  ArtistAlbumLite,
  ArtistLite,
  ArtistRelease,
} from "@/types/artists";

export async function searchArtists(query: string): Promise<ArtistLite[]> {
  const response = await fetch(
    `/api/searchArtists?q=${encodeURIComponent(query)}`,
  );
  if (!response.ok) throw new Error("Error al buscar artistas");
  const data = (await response.json()) as {
    artists?: { items?: ArtistLite[] };
  };
  return data.artists?.items ?? [];
}

export async function getArtistInfo(
  artistId: string,
): Promise<ArtistLite | null> {
  const response = await fetch(
    `/api/getArtist?id=${encodeURIComponent(artistId)}`,
  );
  if (!response.ok) return null;
  const data = (await response.json()) as ArtistLite;
  return data?.id ? data : null;
}

export async function getArtistAlbums(
  artistId: string,
): Promise<ArtistAlbumLite[]> {
  const response = await fetch(
    `/api/getArtistAlbums?id=${encodeURIComponent(artistId)}`,
  );
  if (!response.ok) throw new Error("Error al obtener la discografía");
  const data = (await response.json()) as { albums?: ArtistAlbumLite[] };
  return data.albums ?? [];
}

// La identidad viaja en el token de la sesión; la API deriva el usuario de él.
export async function getUserArtists(): Promise<ArtistLite[]> {
  const response = await authFetch("/api/userArtists");
  if (!response.ok) throw new Error("Error al cargar tus artistas");
  const data = (await response.json()) as { artists?: ArtistLite[] };
  return data.artists ?? [];
}

export async function getArtistReleases(): Promise<ArtistRelease[]> {
  const response = await authFetch("/api/artistReleases");
  if (!response.ok) throw new Error("Error al cargar las novedades");
  const data = (await response.json()) as { releases?: ArtistRelease[] };
  return data.releases ?? [];
}

export async function toggleArtistFavorite(
  artist: ArtistLite,
): Promise<boolean> {
  const response = await authFetch("/api/toggleArtistFavorite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist }),
  });
  if (!response.ok) throw new Error("Error al actualizar el artista favorito");
  const data = (await response.json()) as { favorite?: boolean };
  return Boolean(data.favorite);
}
