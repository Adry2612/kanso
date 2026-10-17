export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface SpotifyArtist {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface SpotifyAlbum {
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  type: string;
  uri: string;
  artists: SpotifyArtist[];
  tracks?: {
    items: SpotifyTrack[];
  };
}

export interface SpotifyTrack {
  name: string;
  track_number: number;
  artists: SpotifyArtist[];
  duration_ms: number;
  explicit: boolean;
  id: string;
}
