import "server-only";

import { normalizeMoods } from "@/constants/moods";
import { sanitizeCollectionTags } from "@/utils/collectionTags";
import { normalizeCollectionFormats } from "@/utils/formats";
import { reportApiError } from "@/lib/sentry";
import type { Album } from "@/types/album";
import type {
  CollectionFormat,
  CollectionTag,
  ListenLaterAlbum,
} from "@/types/collection";
import type { SpotifyAlbum } from "@/types/spotify";
import { createCollectionRepository, type CollectionWrite } from "./repository";

const VALID_FORMATS: CollectionFormat[] = [
  "digital",
  "cd",
  "cassette",
  "vinyl",
];

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

/** Entrada de la colección tal como la devuelve `GET /api/collection`. */
export type CollectionRecord = {
  id: string;
  albumId: string | null;
  addedAt: unknown;
  savedAt: unknown;
  labeledFeelings: string[];
  activities: unknown;
  tags: unknown;
  format: CollectionFormat[];
  album: Record<string, unknown> | null;
};

export type SaveCollectionAlbumResponse = CollectionWrite & {
  message: string;
  alreadyInCollection?: boolean;
};

type SaveCollectionAlbumBody = {
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

function normalizeFormats(input: unknown): CollectionFormat[] {
  const formats = Array.isArray(input)
    ? [...new Set(input as CollectionFormat[])]
    : [];

  if (
    formats.length === 0 ||
    formats.some((format) => !VALID_FORMATS.includes(format))
  ) {
    throw new CollectionApiError(400, "Formato no válido");
  }

  return formats;
}

function normalizeTags(input: unknown): CollectionTag[] {
  return sanitizeCollectionTags(input);
}

/**
 * Guarda o actualiza un álbum en la colección.
 *
 * Si ya estaba, actualiza emociones/formatos/etiquetas y descarta el pendiente.
 * Si es nuevo, lo crea y alimenta el feed de la comunidad sin bloquear el
 * guardado: un fallo del feed no invalida el guardado en la colección.
 */
export async function saveCollectionAlbum(
  uid: string,
  body: SaveCollectionAlbumBody,
): Promise<SaveCollectionAlbumResponse> {
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

  const write: CollectionWrite = {
    labeledFeelings: normalizeFeelings(feelings),
    activities: normalizeActivities(activitiesInput),
    format: normalizeFormats(format),
    tags: normalizeTags(tags),
  };

  const repository = createCollectionRepository();
  const albumDocId =
    (await repository.findAlbumId(album.id)) ??
    (await repository.createAlbum(album));

  const alreadyInCollection = await repository.saveCollectionEntry(
    uid,
    albumDocId,
    write,
  );

  if (alreadyInCollection) {
    return {
      message: "Colección actualizada",
      alreadyInCollection: true,
      ...write,
    };
  }

  try {
    await repository.touchCommunityAlbum(albumDocId);
  } catch (feedError) {
    reportApiError(feedError, "saveCollectionAlbum", "warning");
  }

  return { message: "Guardado en la colección", ...write };
}

/** Elimina el álbum de la colección; si no estaba, responde sin error. */
export async function removeCollectionAlbum(
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
    return { message: "El álbum no está en la colección", removed: false };
  }

  const refs = await repository.listCollectionRefs(uid, albumDocId);
  if (refs.length === 0) {
    return { message: "El álbum no está en la colección", removed: false };
  }

  await repository.deleteRefs(refs);

  return { message: "Álbum eliminado de la colección", removed: true };
}

/** Colección completa, con el álbum resuelto y ordenada por fecha de alta. */
export async function listCollection(uid: string): Promise<CollectionRecord[]> {
  const repository = createCollectionRepository();
  const collection = await Promise.all(
    (await repository.listCollection(uid)).map(
      async (document): Promise<CollectionRecord> => {
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
          albumId: typeof albumId === "string" ? albumId : null,
          addedAt: toJsonDate(addedAt),
          savedAt: toJsonDate(addedAt),
          labeledFeelings: normalizeMoods((labeledFeelings ?? []) as unknown[]),
          activities: activities ?? [],
          tags: Array.isArray(tags) ? tags : [],
          format: normalizeCollectionFormats(format, ownership),
          album:
            typeof albumId === "string"
              ? await repository.getAlbum(albumId)
              : null,
        };
      },
    ),
  );

  collection.sort(
    (a, b) =>
      new Date(b.addedAt as string | number | Date).getTime() -
      new Date(a.addedAt as string | number | Date).getTime(),
  );

  return collection;
}

/** Pendientes, ignorando los que ya están en la colección. */
export async function listListenLater(
  uid: string,
): Promise<ListenLaterAlbum[]> {
  const repository = createCollectionRepository();
  const pendingDocs = await repository.listPending(uid);

  if (pendingDocs.length === 0) return [];

  const collectionAlbumIds = await repository.listCollectionAlbumIds(uid);

  const albums = await Promise.all(
    pendingDocs.map(async (document): Promise<ListenLaterAlbum | null> => {
      const { albumId, addedAt } = document.data();

      if (
        typeof albumId !== "string" ||
        !albumId.trim() ||
        collectionAlbumIds.has(albumId)
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

  const collectionRefs = await repository.listCollectionRefs(uid, albumDocId);
  if (collectionRefs.length > 0) {
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
