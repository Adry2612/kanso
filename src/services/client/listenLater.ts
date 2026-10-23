import { authFetch } from "@/lib/api/authFetch";
import type { Album } from "@/types/album";
import type {
  ListenLaterAlbum,
  ListenLaterResponse,
  RemoveListenLaterResponse,
  SaveListenLaterResponse,
} from "@/types/favorites";

async function parseJson<T = { error?: string }>(
  response: Response,
): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/** Carga los álbumes pendientes de la persona autenticada. */
export async function getListenLater(): Promise<ListenLaterAlbum[]> {
  const response = await authFetch("/api/listenLater");
  const data = await parseJson<ListenLaterResponse & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data?.error || "No se pudieron cargar los pendientes");
  }

  return data?.albums ?? [];
}

export async function addToListenLater(
  album: Album,
): Promise<SaveListenLaterResponse> {
  const response = await authFetch("/api/listenLater", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album }),
  });

  const data = await parseJson<SaveListenLaterResponse & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo guardar el álbum");
  }

  return data as SaveListenLaterResponse;
}

export async function removeFromListenLater(
  album: Album,
): Promise<RemoveListenLaterResponse> {
  const response = await authFetch("/api/listenLater", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ album }),
  });

  const data = await parseJson<RemoveListenLaterResponse & { error?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo quitar el álbum");
  }

  return (
    data ?? {
      message: "El álbum no estaba en pendientes",
      removed: false,
    }
  );
}
