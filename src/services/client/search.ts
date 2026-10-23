import type { Album } from "@/types/album";
import type { SpotifyArtist } from "@/types/album";

export interface SearchResponse {
  albums?: {
    items?: Album[];
    next?: string | null;
  };
  artists?: {
    items?: SpotifyArtist[];
    next?: string | null;
  };
}

/** Busca álbumes y artistas en la API interna. */
export async function searchAll(
  term: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}) as { error?: string });
    throw new Error(data.error || "Error fetching data");
  }

  return (await response.json()) as SearchResponse;
}
