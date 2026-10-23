/** Tipos compartidos de artistas. */

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

export type ArtistRelease = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { id?: string; name: string }[];
  releaseDate: string;
  albumType: string;
  totalTracks: number;
};
