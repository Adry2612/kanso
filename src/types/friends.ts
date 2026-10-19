/** Tipos compartidos por la API y la UI de amigos. */

export type FriendPerson = {
  uid: string;
  displayName: string;
  photoURL: string | null;
};

export type FriendProfile = FriendPerson & {
  friendCode: string;
};

export type FriendEntry = FriendPerson & {
  since: string | null;
};

export type FriendRequestEntry = {
  id: string;
  person: FriendPerson;
  createdAt: string | null;
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
