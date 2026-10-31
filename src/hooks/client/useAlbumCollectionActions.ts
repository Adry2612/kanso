import { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  saveCollectionAlbum,
  removeCollectionAlbum,
} from "@/services/client/collection";
import {
  addToListenLater,
  removeFromListenLater,
} from "@/services/client/listenLater";
import type { Album } from "@/types/album";
import type { Mood } from "@/types/mood";
import type {
  CollectionFormat,
  CollectionTag,
  SaveCollectionResponse,
  SaveListenLaterResponse,
} from "@/types/collection";

export type AlbumCollectionAction =
  | "save-collection"
  | "save-pending"
  | "remove-collection"
  | "remove-pending";

/** Datos del formulario que se envían al guardar en la colección. */
export interface SaveAlbumDraft {
  feelings: Mood[];
  activities: string[];
  format: CollectionFormat[];
  tags: CollectionTag[];
}

const UNAUTHENTICATED = "Usuario no autenticado";

/**
 * Acciones de colección y pendientes del asistente de guardado. Concentra las
 * llamadas a los servicios de cliente, el estado de carga por acción y el
 * mensaje de error que muestran los pasos del modal.
 */
export function useAlbumCollectionActions(album: Album) {
  const { user } = useAuth();
  const [activeAction, setActiveAction] =
    useState<AlbumCollectionAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(
    async <T>(
      action: AlbumCollectionAction,
      task: () => Promise<T>,
    ): Promise<T | null> => {
      if (!user?.uid) {
        setError(UNAUTHENTICATED);
        return null;
      }

      setActiveAction(action);
      setError(null);

      try {
        return await task();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Error desconocido");
        return null;
      } finally {
        setActiveAction(null);
      }
    },
    [user?.uid],
  );

  const saveToCollection = useCallback(
    (draft: SaveAlbumDraft) =>
      run<SaveCollectionResponse>("save-collection", () =>
        saveCollectionAlbum(
          album,
          draft.feelings,
          draft.format,
          draft.activities,
          draft.tags,
        ),
      ),
    [album, run],
  );

  const saveToListenLater = useCallback(
    () =>
      run<SaveListenLaterResponse>("save-pending", () =>
        addToListenLater(album),
      ),
    [album, run],
  );

  const removeFromCollection = useCallback(
    () => run("remove-collection", () => removeCollectionAlbum(album)),
    [album, run],
  );

  const removeFromPending = useCallback(
    () => run("remove-pending", () => removeFromListenLater(album)),
    [album, run],
  );

  return {
    error,
    clearError,
    isSaving: activeAction === "save-collection",
    isSavingPending: activeAction === "save-pending",
    isRemoving:
      activeAction === "remove-collection" || activeAction === "remove-pending",
    saveToCollection,
    saveToListenLater,
    removeFromCollection,
    removeFromPending,
  };
}
