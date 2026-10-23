import type { ArtistLite } from "@/types/artists";

export function getArtistInitial(name: string | undefined): string {
  return name?.slice(0, 1).toUpperCase() || "A";
}

export function formatFollowers(total: number): string {
  return total.toLocaleString("es");
}

export function getArtistGenres(artist: ArtistLite | null): string[] {
  return (artist?.genres ?? []).slice(0, 3);
}
