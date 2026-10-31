import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMood } from "@/constants/moods";
import { getAlbumGenres } from "@/services/client/albums";
import { normalizeCollectionFormats } from "@/utils/formats";
import { normalizeTagCategory, uniqueTags } from "@/utils/tags";
import { useAlbumCollectionActions } from "@/hooks/client/useAlbumCollectionActions";
import type { Album } from "@/types/album";
import type { Mood } from "@/types/mood";
import type {
  AlbumSaveDestination,
  CollectionAlbum,
  CollectionFormat,
  CollectionTag,
  ListenLaterItem,
  SaveAlbumResult,
} from "@/types/collection";

export type SaveAlbumWizardStage =
  | "collection"
  | "pending"
  | "destination"
  | "steps"
  | "success";

interface StoredFeeling {
  label?: string;
  emoji?: string;
}

interface UseSaveAlbumWizardOptions {
  isOpen: boolean;
  album: Album;
  isInCollection?: boolean;
  isPending?: boolean;
  pendingData?: ListenLaterItem | null;
  collectionData?: CollectionAlbum | null;
  startEditing?: boolean;
  startMovingToCollection?: boolean;
  onSaved?: (result: SaveAlbumResult) => void;
  onPendingSaved?: (pending: ListenLaterItem | null) => void;
  onPendingRemoved?: () => void;
  onClose: () => void;
}

/**
 * Las claves guardadas son canónicas: resolvemos la marca (emoji/símbolo) del
 * catálogo para que la burbuja muestre la etiqueta traducida y no la clave.
 */
function toSavedMoods(entry?: CollectionAlbum | null): Mood[] {
  const stored = (entry?.labeledFeelings ?? []) as unknown as Array<
    string | StoredFeeling | null
  >;

  return stored.map((feeling) => {
    const raw = typeof feeling === "string" ? feeling : feeling?.label;
    const match = getMood(raw);

    return {
      label: match?.key ?? raw ?? "",
      emoji:
        match?.emoji ??
        (typeof feeling === "object" && feeling ? feeling.emoji : undefined) ??
        "🎵",
      symbol: match?.symbol,
    };
  });
}

function draftFromCollection(entry?: CollectionAlbum | null) {
  return {
    feelings: toSavedMoods(entry),
    activities: entry?.activities ?? [],
    format: normalizeCollectionFormats(entry?.format, entry?.ownership),
    tags: entry?.tags ?? [],
  };
}

/**
 * Estado y acciones del asistente de guardado de un álbum: destino, pasos del
 * formulario, edición de una entrada y deshacer. Los componentes del modal solo
 * pintan lo que devuelve este hook.
 */
export function useSaveAlbumWizard({
  isOpen,
  album,
  isInCollection = false,
  isPending = false,
  collectionData = null,
  startEditing = false,
  startMovingToCollection = false,
  onSaved,
  onPendingSaved,
  onPendingRemoved,
  onClose,
}: UseSaveAlbumWizardOptions) {
  const {
    saveToCollection: requestSaveCollection,
    saveToListenLater: requestSavePending,
    removeFromCollection,
    removeFromPending,
    clearError,
    error,
    isSaving,
    isSavingPending,
    isRemoving,
  } = useAlbumCollectionActions(album);

  const [stage, setStage] = useState<SaveAlbumWizardStage>("destination");
  const [step, setStep] = useState(0);
  const [feelings, setFeelings] = useState<Mood[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [format, setFormat] = useState<CollectionFormat[]>(["digital"]);
  const [tags, setTags] = useState<CollectionTag[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAsEdit, setSavedAsEdit] = useState(false);
  const [savedDestination, setSavedDestination] =
    useState<AlbumSaveDestination>("collection");

  const savedFeelings = useMemo(
    () => toSavedMoods(collectionData),
    [collectionData],
  );

  // Los valores iniciales se leen al abrir. Guardarlos en un ref evita que un
  // cambio del padre después de guardar devuelva el modal al paso de edición.
  const initial = useRef({
    isInCollection,
    isPending,
    collectionData,
    startEditing,
    startMovingToCollection,
  });
  initial.current = {
    isInCollection,
    isPending,
    collectionData,
    startEditing,
    startMovingToCollection,
  };

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const options = initial.current;
    const editing = Boolean(options.startEditing);
    const draft = editing
      ? draftFromCollection(options.collectionData)
      : {
          feelings: [],
          activities: [],
          format: ["digital"] as CollectionFormat[],
          tags: [],
        };

    setStep(0);
    setFeelings(draft.feelings);
    setActivities(draft.activities);
    setFormat(draft.format);
    setTags(draft.tags);
    setIsEditing(editing);
    setSavedAsEdit(false);
    setSavedDestination("collection");

    if (editing || options.startMovingToCollection) {
      setStage("steps");
    } else if (options.isInCollection) {
      setStage("collection");
    } else if (options.isPending) {
      setStage("pending");
    } else {
      setStage("destination");
    }

    clearError();

    // Relleno previo del género derivado de Spotify, editable en el TagEditor.
    if (!editing) {
      getAlbumGenres(album.id)
        .then((genres) => {
          if (cancelled || genres.length === 0) return;

          setTags((current) => {
            const hasGenre = current.some(
              (tag) => normalizeTagCategory(tag.category) === "género",
            );
            if (hasGenre) return current;

            return uniqueTags([
              ...current,
              ...genres.map((genre) => ({ category: "género", value: genre })),
            ]);
          });
        })
        .catch(() => {
          // Sin Spotify se guarda sin género; la persona puede añadirlo.
        });
    }

    return () => {
      cancelled = true;
    };
  }, [album.id, clearError, isOpen]);

  const chooseCollection = useCallback(() => {
    setStep(0);
    setStage("steps");
  }, []);

  const saveToListenLater = useCallback(async () => {
    const result = await requestSavePending();
    if (!result) return;

    setSavedDestination("pending");
    setSavedAsEdit(false);
    setStage("success");
    onPendingSaved?.(result.album);
  }, [onPendingSaved, requestSavePending]);

  const save = useCallback(async () => {
    const result = await requestSaveCollection({
      feelings,
      activities,
      format,
      tags,
    });
    if (!result) return;

    setSavedDestination("collection");
    setSavedAsEdit(isEditing);
    setStage("success");

    onSaved?.({
      destination: "collection",
      albumId: album.id,
      feelings: result.feelings,
      activities,
      format,
      tags,
    });
  }, [
    activities,
    album.id,
    feelings,
    format,
    isEditing,
    onSaved,
    requestSaveCollection,
    tags,
  ]);

  const goNext = useCallback(() => {
    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    void save();
  }, [save, step]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setStep((current) => current - 1);
      return;
    }

    onClose();
  }, [onClose, step]);

  /** Pasa del resumen de una entrada existente al formulario de edición. */
  const edit = useCallback(() => {
    const draft = draftFromCollection(initial.current.collectionData);

    setFeelings(draft.feelings);
    setActivities(draft.activities);
    setFormat(draft.format);
    setTags(draft.tags);
    setStep(0);
    setIsEditing(true);
    setStage("steps");
  }, []);

  /** Pasa de un pendiente al formulario para moverlo a la colección. */
  const moveToCollection = useCallback(() => {
    setFeelings([]);
    setActivities([]);
    setFormat(["digital"]);
    setTags([]);
    setStep(0);
    setIsEditing(false);
    setStage("steps");
  }, []);

  const undo = useCallback(async () => {
    if (savedDestination === "pending") {
      const result = await removeFromPending();
      if (!result) return;

      onPendingRemoved?.();
      onClose();
      return;
    }

    await removeFromCollection();
    onClose();
  }, [
    onClose,
    onPendingRemoved,
    removeFromCollection,
    removeFromPending,
    savedDestination,
  ]);

  const deleteFromCollection = useCallback(async () => {
    await removeFromCollection();
    onClose();
  }, [onClose, removeFromCollection]);

  const deleteFromPending = useCallback(async () => {
    const result = await removeFromPending();
    if (!result) return;

    onPendingRemoved?.();
    onClose();
  }, [onClose, onPendingRemoved, removeFromPending]);

  return {
    stage,
    step,
    feelings,
    activities,
    format,
    tags,
    setFeelings,
    setActivities,
    setFormat,
    setTags,
    savedFeelings,
    isEditing,
    savedAsEdit,
    savedDestination,
    isSaving,
    isSavingPending,
    isRemoving,
    error,
    chooseCollection,
    saveToListenLater,
    save,
    goNext,
    goBack,
    edit,
    moveToCollection,
    undo,
    deleteFromCollection,
    deleteFromPending,
  };
}
