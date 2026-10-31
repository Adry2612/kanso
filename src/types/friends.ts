/** Tipos compartidos por la API y la UI de amigos. */

import type { CollectionFormat } from "./collection";

export type FriendPerson = {
  uid: string;
  displayName: string;
  photoURL: string | null;
};

/** Secciones de la biblioteca que se pueden compartir por separado. */
export type FriendSharingSettings = {
  recommendations: boolean;
  collection: boolean;
  artists: boolean;
};

export type FriendProfile = FriendPerson & {
  friendCode: string;
  sharing: FriendSharingSettings;
};

export type FriendEntry = FriendPerson & {
  since: string | null;
};

export type FriendRequestEntry = {
  id: string;
  person: FriendPerson;
  createdAt: string | null;
};

export type FriendRequestNotificationsResponse = {
  incoming: FriendRequestEntry[];
};

export type FriendsResponse = {
  profile: FriendProfile;
  friends: FriendEntry[];
  incoming: FriendRequestEntry[];
  outgoing: FriendRequestEntry[];
};

export type PublicProfileRelation = "none" | "pending" | "friend" | "self";

export type PublicProfileResponse = {
  displayName: string;
  photoURL: string | null;
  relation: PublicProfileRelation;
  pendingDirection?: "incoming" | "outgoing";
};

export type FriendRequestResult = {
  status: "pending" | "accepted";
};

export type FriendRequestAction = "accept" | "reject";

/** Proyección mínima de un álbum para la biblioteca compartida. */
export type SharedAlbumSummary = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
  releaseDate: string | null;
  spotifyUrl: string | null;
};

export type SharedRecommendation = {
  id: string;
  providedAt: string | null;
  moods: string[];
  album: SharedAlbumSummary | null;
};

export type SharedCollectionAlbum = {
  id: string;
  addedAt: string | null;
  labeledFeelings: string[];
  activities: string[];
  format: CollectionFormat[];
  album: SharedAlbumSummary | null;
};

export type SharedArtist = {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  addedAt: string | null;
};

/** Respuesta de `GET /api/friends/[uid]/library`. */
export type FriendLibraryResponse = {
  profile: { displayName: string; photoURL: string | null };
  sharing: FriendSharingSettings;
  recommendations?: SharedRecommendation[];
  collection?: SharedCollectionAlbum[];
  artists?: SharedArtist[];
};
