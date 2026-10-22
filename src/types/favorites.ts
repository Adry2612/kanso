import { SpotifyAlbum } from "./spotify";

export type SortMethod =
  | ""
  | "recent"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "artist"
  | "release-year-asc"
  | "release-year-desc";

export interface FilterOptions {
  moods: string[];
  genres: string[];
  formats: FavoriteFormat[];
  tags: FavoriteTag[];
}

export type FavoriteFormat = "digital" | "cd" | "cassette" | "vinyl";

export interface FavoriteTag {
  category: string;
  value: string;
}

export interface FavoriteOwnership {
  type: "digital" | "physical";
  format: Exclude<FavoriteFormat, "digital">[];
}

export interface GroupedFavorites {
  groupName: string;
  items: FavoriteAlbum[];
}

export interface FavoriteAlbum {
  id: string;
  album: SpotifyAlbum;
  savedAt: string | Date;
  labeledFeelings?: string[];
  activities?: string[];
  /** Formatos en los que el usuario tiene o escucha el álbum. */
  format: FavoriteFormat[];
  tags?: FavoriteTag[];
  userId: string;
}

export type AlbumSaveDestination = "collection" | "pending";

export interface ListenLaterAlbum {
  /** Identificador del documento en `users/{uid}/listenLater`. */
  id: string;
  /** Identificador del documento en el catálogo global `albums`. */
  albumId: string;
  addedAt: string | Date;
  album: SpotifyAlbum;
}

export interface ListenLaterResponse {
  albums: ListenLaterAlbum[];
}

export interface SaveListenLaterResponse {
  message: string;
  alreadyPending: boolean;
  album: ListenLaterAlbum;
}

export interface RemoveListenLaterResponse {
  message: string;
  removed: boolean;
}

/**
 * Resultado normalizado del guardado, independientemente del destino elegido.
 * Los pendientes no tienen emociones ni metadatos de colección.
 */
export interface SaveAlbumResult {
  destination: AlbumSaveDestination;
  albumId: string;
  feelings: string[];
  activities: string[];
  format: FavoriteFormat[];
  tags: FavoriteTag[];
  addedAt?: string | Date;
  listenLater?: ListenLaterAlbum;
}

/**
 * Respuesta de recomendaciones basadas en actividad
 */
export interface RecommendedAlbumInfo {
  external_urls?: { spotify?: string };
  images: { url: string }[];
  name: string;
  artists: { name: string; id: string }[];
  release_date?: string;
  total_tracks?: number;
  id?: string;
}

export interface ActivityRecommendation {
  id: string;
  albumId: string;
  labeledFeelings: string[];
  matchingMoods: string[]; // Moods del álbum que coinciden con la actividad
  compatibilityScore: number; // 0-1, qué tan compatible es con la actividad
  albumInfo?: RecommendedAlbumInfo;
}

export interface ActivityRecommendationResponse {
  activity: string;
  optimalMoods: string[]; // Moods óptimos para la actividad
  recommendations: ActivityRecommendation[];
  totalFound: number;
  message?: string;
}

/**
 * Respuesta al guardar un favorito con emociones sugeridas
 */
export interface SaveFavoriteResponse {
  message: string;
  feelings: string[];
  activities?: string[];
  format: FavoriteFormat[];
  suggestedActivities: string[]; // Actividades óptimas para esos feelings
}
