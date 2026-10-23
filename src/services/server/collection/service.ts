import "server-only";

import { normalizeMoods } from "@/constants/moods";
import { normalizeFavoriteFormats } from "@/lib/favorites";
import { reportApiError } from "@/lib/sentry";
import type { Album } from "@/types/album";
import type {
  FavoriteFormat,
  FavoriteTag,
  ListenLaterAlbum,
} from "@/types/favorites";
import type { SpotifyAlbum } from "@/types/spotify";
import { createCollectionRepository, type FavoriteWrite } from "./repository";

const VALID_FORMATS: FavoriteFormat[] = ["digital", "cd", "cassette", "vinyl"];

/** Error con un estado HTTP que la ruta puede devolver tal cual. */
export class CollectionApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "CollectionApiError";
  }
}

/** Favorito tal como lo devuelve `GET /api/userFavorites`. */
export type FavoriteRecord = {
  id: string;
  addedAt: unknown;
  savedAt: unknown;
  labeledFeelings: string[];
  activities: unknown;
  tags: unknown;
  format: FavoriteFormat[];
  album: Record<string, unknown> | null;
};

export type ToggleFavoriteResponse = FavoriteWrite & {
  message: string;
  alreadyFavorite?: boolean;
};

type ToggleFavoriteBody = {
  album?: Album;
  feelings?: unknown;
  format?: unknown;
  activities?: unknown;
  tags?: unknown;
};

function isValidAlbum(album: unknown): album is Album {
  return Boolean(
    album &&
    typeof album === "object" &&
    typeof (album as { id?: unknown }).id === "string" &&
    (album as { id: string }).id.trim(),
  );
}

function toJsonDate(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  return value ?? null;
}

function toIsoDate(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

function normalizeFeelings(input: unknown): string[] {
  const feelingList = Array.isArray(input) ? input : [];

  return normalizeMoods(
    feelingList.map((feeling) =>
      typeof feeling === "string"
        ? feeling
        : typeof (feeling as { label?: unknown })?.label === "string"
          ? (feeling as { label: string }).label
          : "",
    ),
  );
}

function normalizeActivities(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((activity): activity is string => typeof activity === "string")
    .map((activity) => activity.trim())
    .filter(Boolean);
}

function normalizeFormats(input: unknown): FavoriteFormat[] {
  const formats = Array.isArray(input)
    ? [...new Set(input as FavoriteFormat[])]
    : [];

  if (
    formats.length === 0 ||
    formats.some((format) => !VALID_FORMATS.includes(format))
  ) {
    throw new CollectionApiError(400, "Formato no válido");
  }

  return formats;
}

function normalizeTags(input: unknown): FavoriteTag[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(
      (tag): tag is FavoriteTag =>
        typeof (tag as { category?: unknown })?.category === "string" &&
        typeof (tag as { value?: unknown })?.value === "string",
    )
    .map((tag) => ({
      category: tag.category.trim().toLowerCase(),
      value: tag.value.trim().toLowerCase(),
    }))
    .filter((tag) => tag.category && tag.value);
}

/**
 * Guarda o actualiza un álbum en la colección.
 *
 * Si ya estaba, actualiza emociones/formatos/etiquetas y descarta el pendiente.
 * Si es nuevo, lo crea y alimenta el feed de la comunidad sin bloquear el
 * guardado: un fallo del feed no invalida el favorito.
 */
export async function toggleFavorite(
  uid: string,
  body: ToggleFavoriteBody,
): Promise<ToggleFavoriteResponse> {
  const {
    album,
    feelings,
    format = ["digital"],
    activities: activitiesInput = [],
    tags = [],
  } = body;

  if (!isValidAlbum(album)) {
    throw new CollectionApiError(400, "Álbum no válido");
  }

  const write: FavoriteWrite = {
    labeledFeelings: normalizeFeelings(feelings),
    activities: normalizeActivities(activitiesInput),
    format: normalizeFormats(format),
    tags: normalizeTags(tags),
  };

  const repository = createCollectionRepository();
  const albumDocId =
    (await repository.findAlbumId(album.id)) ??
    (await repository.createAlbum(album));

  const existingRefs = await repository.listFavoriteRefs(uid, albumDocId);
  const existingRef = existingRefs[0] ?? null;

  await repository.saveFavorite(uid, albumDocId, write, existingRef);

  if (existingRef) {
    return {
      message: "Favorito actualizado",
      alreadyFavorite: true,
      ...write,
    };
  }

  try {
    await repository.touchCommunityAlbum(albumDocId);
  } catch (feedError) {
    reportApiError(feedError, "toggleFavorite", "warning");
  }

  return { message: "Favorito guardado", ...write };
}

/** Elimina el álbum de la colección; si no estaba, responde sin error. */
export async function removeFavorite(
  uid: string,
  body: { album?: unknown },
): Promise<{ message: string; removed: boolean }> {
  const { album } = body;

  if (!isValidAlbum(album)) {
    throw new CollectionApiError(400, "Álbum no válido");
  }

  const repository = createCollectionRepository();
  const albumDocId = await repository.findAlbumId(album.id);

  if (!albumDocId) {
    return { message: "El álbum no está en favoritos", removed: false };
  }

  const refs = await repository.listFavoriteRefs(uid, albumDocId);
  if (refs.length === 0) {
    return { message: "El álbum no está en favoritos", removed: false };
  }

  await repository.deleteRefs(refs);

  return { message: "Favorito eliminado correctamente", removed: true };
}

/** Colección completa, con el álbum resuelto y ordenada por fecha de alta. */
export async function listFavorites(uid: string): Promise<FavoriteRecord[]> {
  const repository = createCollectionRepository();
  const favorites = await Promise.all(
    (await repository.listFavorites(uid)).map(
      async (document): Promise<FavoriteRecord> => {
        const {
          albumId,
          addedAt,
          labeledFeelings,
          activities,
          tags,
          format,
          ownership,
        } = document.data();

        return {
          id: document.id,
          addedAt: toJsonDate(addedAt),
          savedAt: toJsonDate(addedAt),
          labeledFeelings: normalizeMoods((labeledFeelings ?? []) as unknown[]),
          activities: activities ?? [],
          tags: Array.isArray(tags) ? tags : [],
          format: normalizeFavoriteFormats(format, ownership),
          album:
            typeof albumId === "string"
              ? await repository.getAlbum(albumId)
              : null,
        };
      },
    ),
  );

  favorites.sort(
    (a, b) =>
      new Date(b.addedAt as string | number | Date).getTime() -
      new Date(a.addedAt as string | number | Date).getTime(),
  );

  return favorites;
}

/** Pendientes, ignorando los que ya están en la colección. */
export async function listListenLater(
  uid: string,
): Promise<ListenLaterAlbum[]> {
  const repository = createCollectionRepository();
  const pendingDocs = await repository.listPending(uid);

  if (pendingDocs.length === 0) return [];

  const favoriteAlbumIds = await repository.listFavoriteAlbumIds(uid);

  const albums = await Promise.all(
    pendingDocs.map(async (document): Promise<ListenLaterAlbum | null> => {
      const { albumId, addedAt } = document.data();

      if (
        typeof albumId !== "string" ||
        !albumId.trim() ||
        favoriteAlbumIds.has(albumId)
      ) {
        return null;
      }

      const album = await repository.getAlbum(albumId);
      if (!album) return null;

      return {
        id: document.id,
        albumId,
        addedAt: toIsoDate(addedAt) ?? new Date(0).toISOString(),
        album: album as unknown as SpotifyAlbum,
      };
    }),
  );

  return albums.filter((album): album is ListenLaterAlbum => album !== null);
}

/** Añade a pendientes; rechaza si el álbum ya está en la colección. */
export async function addListenLater(
  uid: string,
  body: { album?: unknown },
): Promise<{
  message: string;
  alreadyPending: boolean;
  album: ListenLaterAlbum;
}> {
  const { album } = body;

  if (!isValidAlbum(album)) {
    throw new CollectionApiError(400, "Álbum no válido");
  }

  const repository = createCollectionRepository();
  const existingAlbumId = await repository.findAlbumId(album.id);

  let albumDocId: string;
  let albumData: Album;

  if (existingAlbumId) {
    albumDocId = existingAlbumId;
    albumData =
      ((await repository.getAlbum(existingAlbumId)) as unknown as Album) ??
      album;
  } else {
    albumDocId = await repository.createAlbum(album);
    albumData = album;
  }

  const favoriteRefs = await repository.listFavoriteRefs(uid, albumDocId);
  if (favoriteRefs.length > 0) {
    throw new CollectionApiError(409, "Este álbum ya está en tu colección");
  }

  const pendingSnap = await repository.getPending(uid, albumDocId);
  if (pendingSnap.exists) {
    const pendingData = pendingSnap.data() ?? {};

    return {
      message: "El álbum ya estaba en pendientes",
      alreadyPending: true,
      album: {
        id: pendingSnap.id,
        albumId: pendingData.albumId ?? albumDocId,
        addedAt: toIsoDate(pendingData.addedAt) ?? new Date(0).toISOString(),
        album: albumData as unknown as SpotifyAlbum,
      },
    };
  }

  await repository.setPending(uid, albumDocId);

  return {
    message: "Álbum guardado para escuchar",
    alreadyPending: false,
    album: {
      id: albumDocId,
      albumId: albumDocId,
      addedAt: new Date().toISOString(),
      album: albumData as unknown as SpotifyAlbum,
    },
  };
}

/** Quita el álbum de pendientes; si no estaba, responde sin error. */
export async function removeListenLater(
  uid: string,
  body: { album?: unknown },
): Promise<{ message: string; removed: boolean }> {
  const { album } = body;

  if (!isValidAlbum(album)) {
    throw new CollectionApiError(400, "Álbum no válido");
  }

  const repository = createCollectionRepository();
  const albumDocId = await repository.findAlbumId(album.id);

  if (!albumDocId) {
    return { message: "El álbum no está en pendientes", removed: false };
  }

  const refs = await repository.findPendingRefs(uid, albumDocId);
  if (refs.length === 0) {
    return { message: "El álbum no está en pendientes", removed: false };
  }

  await repository.deleteRefs(refs);

  return { message: "Álbum eliminado de pendientes", removed: true };
}
