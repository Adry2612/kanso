import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyImage,
  SpotifyTrack,
} from "./album";

export interface SpotifyTokenResponse {
  access_token: string;
  expires_in?: number;
}

export interface SpotifyPaging<T> {
  items?: T[];
  next?: string | null;
}

export interface SpotifySearchResponse {
  albums?: SpotifyPaging<SpotifyAlbum>;
  artists?: SpotifyPaging<SpotifyArtist>;
}

export interface SpotifyArtistAlbum {
  id: string;
  name: string;
  images?: SpotifyImage[];
  artists?: SpotifyArtist[];
  release_date: string;
  release_date_precision?: string;
  album_type: string;
  album_group?: string;
  total_tracks?: number;
}

export interface SpotifyArtistAlbumsResponse {
  items?: SpotifyArtistAlbum[];
  next?: string | null;
}

export interface SpotifyTrackPage {
  items?: SpotifyTrack[];
}
