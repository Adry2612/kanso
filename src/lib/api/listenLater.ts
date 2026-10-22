// src/lib/api/listenLater.ts
import { Album } from "../../../models/album";
import {
  ListenLaterAlbum,
  ListenLaterResponse,
  RemoveListenLaterResponse,
  SaveListenLaterResponse,
} from "@/types/favorites";
import { authFetch } from "@/lib/api/authFetch";

async function parseJson<T = { error?: string }>(
  res: Response,
): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getListenLater = async (): Promise<ListenLaterAlbum[]> => {
  const res = await authFetch("/api/listenLater");
  const data = await parseJson<ListenLaterResponse & { error?: string }>(res);

  if (!res.ok) {
    throw new Error(data?.error || "No se pudieron cargar los pendientes");
  }

  return data?.albums ?? [];
};

export const addToListenLater = async (
  album: Album,
): Promise<SaveListenLaterResponse> => {
  const res = await authFetch("/api/listenLater", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album }),
  });

  const data = await parseJson<SaveListenLaterResponse & { error?: string }>(
    res,
  );

  if (!res.ok) {
    throw new Error(data?.error || "No se pudo guardar el álbum");
  }

  return data as SaveListenLaterResponse;
};

export const removeFromListenLater = async (
  album: Album,
): Promise<RemoveListenLaterResponse> => {
  const res = await authFetch("/api/listenLater", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album }),
  });

  const data = await parseJson<RemoveListenLaterResponse & { error?: string }>(
    res,
  );

  if (!res.ok) {
    throw new Error(data?.error || "No se pudo quitar el álbum");
  }

  return (
    data ?? {
      message: "El álbum no estaba en pendientes",
      removed: false,
    }
  );
};
