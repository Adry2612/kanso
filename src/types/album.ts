/** Tipos canónicos de álbumes, artistas y pistas. */

export interface ExternalUrls {
  spotify: string;
}

export interface Image {
  height: number;
  url: string;
  width: number;
}

export interface Artist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface Album {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  type: string;
  uri: string;
  artists: Artist[];
  /** Géneros normalizados que puede aportar el catálogo propio. */
  genres?: string[];
}

/** Forma que devuelve el proveedor Spotify. */
export type SpotifyExternalUrls = ExternalUrls;
export type SpotifyImage = Image;
export type SpotifyArtist = Artist;

export interface SpotifyTrack {
  name: string;
  track_number: number;
  artists: SpotifyArtist[];
  duration_ms: number;
  explicit: boolean;
  id: string;
}

export interface SpotifyAlbum extends Album {
  tracks?: {
    items: SpotifyTrack[];
  };
}

/** Proyección mínima de una pista para la interfaz. */
export interface TrackArtist {
  name: string;
  id: string;
}

export interface Track {
  name: string;
  track_number: number;
  artists: TrackArtist[];
}
