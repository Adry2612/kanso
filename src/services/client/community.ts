import type { CommunityAlbum, CommunitySearch } from "@/types/community";

export async function getCommunitySearches(): Promise<string[]> {
  const response = await fetch("/api/communitySearches");
  if (!response.ok) return [];

  const data = (await response.json()) as { searches?: CommunitySearch[] };
  return (data.searches ?? [])
    .map((item) => item.term)
    .filter((term): term is string => Boolean(term));
}

export async function registerCommunitySearch(
  term: string,
  previousTerm?: string,
): Promise<void> {
  await fetch("/api/communitySearches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ term, previousTerm }),
  });
}

export async function getCommunityAlbums(): Promise<CommunityAlbum[]> {
  const response = await fetch("/api/communityAlbums");
  if (!response.ok) return [];

  const data = (await response.json()) as { albums?: CommunityAlbum[] };
  return data.albums ?? [];
}
