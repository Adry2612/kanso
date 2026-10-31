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

export type CollectionGroupBy = "none" | "date" | "artist" | "letter" | "year";

export interface FilterOptions {
  groupBy: CollectionGroupBy;
  incompleteOnly: boolean;
  moods: string[];
  genres: string[];
  formats: CollectionFormat[];
  tags: CollectionTag[];
}

export type CollectionFormat = "digital" | "cd" | "cassette" | "vinyl";

export interface CollectionTag {
  category: string;
  value: string;
}

export interface CollectionOwnership {
  type: "digital" | "physical";
  format: Exclude<CollectionFormat, "digital">[];
}

export interface GroupedCollection<T = CollectionAlbum> {
  groupName: string;
  items: T[];
}

export interface CollectionAlbum {
  id: string;
  /** Identificador del documento en el catálogo global `albums`. */
  albumId?: string;
  album: SpotifyAlbum;
  savedAt: string | Date;
  labeledFeelings?: string[];
  activities?: string[];
  /** Formatos en los que el usuario tiene o escucha el álbum. */
  format: CollectionFormat[];
  tags?: CollectionTag[];
  /** Compatibilidad con documentos antiguos. */
  ownership?: CollectionOwnership;
  moods?: string[];
  userId: string;
}

export type CollectionTab = "collection" | "listenLater";

export type CollectionView = "grid" | "list";

export type CollectionFilters = FilterOptions;

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
  format: CollectionFormat[];
  tags: CollectionTag[];
  addedAt?: string | Date;
  listenLater?: ListenLaterAlbum;
}

export type {
  ActivityRecommendation,
  ActivityRecommendationResponse,
  RecommendedAlbumInfo,
} from "./recommendations";

/**
 * Respuesta al guardar un álbum en la colección con emociones sugeridas
 */
export interface SaveCollectionResponse {
  message: string;
  feelings: string[];
  activities?: string[];
  format: CollectionFormat[];
  suggestedActivities: string[]; // Actividades óptimas para esos feelings
}
