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
  /** Identificador del documento en el catálogo global `albums`. */
  albumId?: string;
  album: SpotifyAlbum;
  savedAt: string | Date;
  labeledFeelings?: string[];
  activities?: string[];
  /** Formatos en los que el usuario tiene o escucha el álbum. */
  format: FavoriteFormat[];
  tags?: FavoriteTag[];
  /** Compatibilidad con documentos antiguos. */
  ownership?: FavoriteOwnership;
  moods?: string[];
  userId: string;
}

export type FavoritesTab = "collection" | "listenLater";

export type CollectionFilters = FilterOptions;

/** Favorito de la colección tal como lo devuelve `GET /api/userFavorites`. */
export type CollectionFavorite = FavoriteAlbum;

/** Elemento de la lista de pendientes tal como lo devuelve la API. */
export type ListenLaterItem = ListenLaterAlbum;

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

export type {
  ActivityRecommendation,
  ActivityRecommendationResponse,
  RecommendedAlbumInfo,
} from "./recommendations";

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
