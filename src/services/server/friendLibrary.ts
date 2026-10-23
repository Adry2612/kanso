import "server-only";

import { adminDb } from "@/lib/firebaseAdmin";
import { normalizeMoods } from "@/constants/moods";
import { normalizeFavoriteFormats } from "@/lib/favorites";
import { toIsoDate } from "./friends";
import type {
  SharedAlbumSummary,
  SharedArtist,
  SharedCollectionAlbum,
  SharedRecommendation,
} from "@/types/friends";

export type {
  FriendLibraryResponse,
  SharedAlbumSummary,
  SharedArtist,
  SharedCollectionAlbum,
  SharedRecommendation,
} from "@/types/friends";

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toImages(value: unknown): { url: string }[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((image) => {
    if (!image || typeof image !== "object") return [];
    const url = (image as { url?: unknown }).url;
    return typeof url === "string" && url ? [{ url }] : [];
  });
}

function toAlbumArtists(value: unknown): { name: string }[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((artist) => {
    if (!artist || typeof artist !== "object") return [];
    const name = (artist as { name?: unknown }).name;
    return typeof name === "string" && name ? [{ name }] : [];
  });
}

function toSharedAlbum(
  albumId: string,
  data: Record<string, unknown> | undefined,
): SharedAlbumSummary | null {
  if (!data) return null;

  const externalUrls =
    data.external_urls && typeof data.external_urls === "object"
      ? (data.external_urls as { spotify?: unknown })
      : null;

  return {
    id: typeof data.id === "string" && data.id ? data.id : albumId,
    name: typeof data.name === "string" ? data.name : "",
    images: toImages(data.images),
    artists: toAlbumArtists(data.artists),
    releaseDate:
      typeof data.release_date === "string" ? data.release_date : null,
    spotifyUrl:
      typeof externalUrls?.spotify === "string" ? externalUrls.spotify : null,
  };
}

function albumIdsFrom(data: Record<string, unknown>): string[] {
  return typeof data.albumId === "string" && data.albumId ? [data.albumId] : [];
}

/**
 * Resuelve los álbumes en una sola operación por lote.
 *
 * Las claves del mapa son los IDs guardados en la subcolección; el `id` del
 * resumen conserva el de Spotify cuando está disponible.
 */
async function loadAlbums(
  ids: string[],
): Promise<Map<string, SharedAlbumSummary | null>> {
  const unique = [...new Set(ids)];
  const result = new Map<string, SharedAlbumSummary | null>();
  if (unique.length === 0) return result;

  const db = adminDb();
  const snapshots = await db.getAll(
    ...unique.map((id) => db.doc(`albums/${id}`)),
  );

  snapshots.forEach((snapshot) => {
    result.set(
      snapshot.id,
      snapshot.exists
        ? toSharedAlbum(snapshot.id, snapshot.data() ?? {})
        : null,
    );
  });

  return result;
}

function sortByDateDesc<T>(
  items: T[],
  dateOf: (item: T) => string | null,
): T[] {
  return [...items].sort((a, b) =>
    (dateOf(b) ?? "").localeCompare(dateOf(a) ?? ""),
  );
}

/** Historial de recomendaciones que la persona ha compartido. */
export async function loadSharedRecommendations(
  uid: string,
): Promise<SharedRecommendation[]> {
  const db = adminDb();
  const snapshot = await db
    .collection(`users/${uid}/recomendationHistory`)
    .get();

  const albums = await loadAlbums(
    snapshot.docs.flatMap((doc) => albumIdsFrom(doc.data())),
  );

  const recommendations = snapshot.docs.map((doc) => {
    const data = doc.data();
    const albumId = typeof data.albumId === "string" ? data.albumId : "";

    return {
      id: doc.id,
      providedAt: toIsoDate(data.providedAt),
      moods: normalizeMoods(Array.isArray(data.moods) ? data.moods : []),
      album: albumId ? (albums.get(albumId) ?? null) : null,
    };
  });

  return sortByDateDesc(recommendations, (item) => item.providedAt);
}

/** Álbumes de la colección compartidos, sin etiquetas personales. */
export async function loadSharedCollection(
  uid: string,
): Promise<SharedCollectionAlbum[]> {
  const db = adminDb();
  const snapshot = await db.collection(`users/${uid}/favorites`).get();

  const albums = await loadAlbums(
    snapshot.docs.flatMap((doc) => albumIdsFrom(doc.data())),
  );

  const collection = snapshot.docs.map((doc) => {
    const data = doc.data();
    const albumId = typeof data.albumId === "string" ? data.albumId : "";

    return {
      id: doc.id,
      addedAt: toIsoDate(data.addedAt),
      labeledFeelings: normalizeMoods(
        Array.isArray(data.labeledFeelings) ? data.labeledFeelings : [],
      ),
      activities: toStringArray(data.activities),
      format: normalizeFavoriteFormats(data.format, data.ownership),
      album: albumId ? (albums.get(albumId) ?? null) : null,
    };
  });

  return sortByDateDesc(collection, (item) => item.addedAt);
}

/** Artistas favoritos compartidos. */
export async function loadSharedArtists(uid: string): Promise<SharedArtist[]> {
  const snapshot = await adminDb().collection(`users/${uid}/artists`).get();

  const artists = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id:
        typeof data.artistId === "string" && data.artistId
          ? data.artistId
          : doc.id,
      name: typeof data.name === "string" ? data.name : "",
      images: toImages(data.images),
      genres: toStringArray(data.genres),
      addedAt: toIsoDate(data.addedAt),
    };
  });

  return sortByDateDesc(artists, (item) => item.addedAt);
}
