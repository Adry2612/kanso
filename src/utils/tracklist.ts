import type { SpotifyTrack, Track } from "@/types/album";

/** Proyecta las pistas del proveedor al modelo mínimo de la interfaz. */
export function toTracklist(tracks: SpotifyTrack[] | undefined): Track[] {
  return (tracks ?? []).map((track) => ({
    name: track.name,
    track_number: track.track_number,
    artists: (track.artists ?? []).map((artist) => ({
      name: artist.name,
      id: artist.id,
    })),
  }));
}
