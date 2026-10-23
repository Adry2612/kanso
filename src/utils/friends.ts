import type {
  FriendLibraryResponse,
  FriendProfile,
  FriendRequestResult,
  FriendSharingSettings,
  PublicProfileResponse,
  SharedAlbumSummary,
  SharedRecommendation,
} from "@/types/friends";

/** Secciones de compartición que se pueden activar por separado. */
export const SHARING_SECTIONS: (keyof FriendSharingSettings)[] = [
  "recommendations",
  "collection",
  "artists",
];

/** Longitud de un código de amigo válido. */
export const FRIEND_CODE_LENGTH = 8;

/** Quita espacios y guiones y pasa el código a mayúsculas. */
export function normalizeFriendCode(raw: string): string {
  return raw.replace(/[\s-]/g, "").toUpperCase();
}

export function isValidFriendCode(normalized: string): boolean {
  return normalized.length === FRIEND_CODE_LENGTH;
}

/** Enlace de acceso conservando el destino dentro de la app. */
export function friendLoginHref(
  next: string,
  mode: "login" | "register",
): string {
  return `/login?mode=${mode}&next=${encodeURIComponent(next)}`;
}

/** Aplica un cambio de compartición sobre el perfil ya cargado. */
export function withSharing(
  profile: FriendProfile,
  sharing: FriendSharingSettings,
): FriendProfile {
  return { ...profile, sharing };
}

/** Parche optimista de una sola sección de compartición. */
export function withSharingSection(
  profile: FriendProfile,
  section: keyof FriendSharingSettings,
  value: boolean,
): FriendProfile {
  return withSharing(profile, { ...profile.sharing, [section]: value });
}

/** Traduce el resultado de enviar una solicitud a la relación del perfil. */
export function applyFriendRequestResult(
  profile: PublicProfileResponse,
  result: FriendRequestResult,
): PublicProfileResponse {
  if (result.status === "accepted") {
    return { ...profile, relation: "friend", pendingDirection: undefined };
  }

  return { ...profile, relation: "pending", pendingDirection: "outgoing" };
}

export type SharedSection = "recommendations" | "collection" | "artists";

export type DisplayableRecommendation = SharedRecommendation & {
  providedAt: string;
  album: SharedAlbumSummary;
};

/** Recomendaciones que se pueden pintar: con fecha y álbum resueltos. */
export function getDisplayableRecommendations(
  items: SharedRecommendation[] | undefined,
): DisplayableRecommendation[] {
  return (items ?? []).filter((item): item is DisplayableRecommendation =>
    Boolean(item.providedAt && item.album),
  );
}

/** Secciones que el amigo ha compartido, en el orden de las pestañas. */
export function getAvailableSharedSections(
  data: FriendLibraryResponse,
): SharedSection[] {
  const sections: SharedSection[] = [];
  if (data.recommendations !== undefined) sections.push("recommendations");
  if (data.collection !== undefined) sections.push("collection");
  if (data.artists !== undefined) sections.push("artists");
  return sections;
}

/** Primera sección con contenido, para abrirla por defecto. */
export function getFirstSharedSectionWithItems(
  data: FriendLibraryResponse,
  recommendationCount: number,
): SharedSection | null {
  if (recommendationCount > 0) return "recommendations";
  if ((data.collection?.length ?? 0) > 0) return "collection";
  if ((data.artists?.length ?? 0) > 0) return "artists";
  return null;
}

/** Mantiene la pestaña elegida si sigue disponible; si no, cae a la primera. */
export function resolveActiveSharedSection(
  selected: SharedSection | null,
  available: SharedSection[],
  firstWithItems: SharedSection | null,
): SharedSection | null {
  if (selected && available.includes(selected)) return selected;
  return firstWithItems ?? available[0] ?? null;
}
