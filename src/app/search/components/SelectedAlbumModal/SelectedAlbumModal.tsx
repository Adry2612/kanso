/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Album } from "../../../../../models/album";
import { SuccessModal } from "./steps/SuccessAlbumModal";
import { SaveAlbumModal } from "./steps/SaveAlbumModal";
import { AlbumAlreadyFavoriteStep } from "./steps/AlbumAlreadyFavoriteStep";
import { AlbumAlreadyPendingStep } from "./steps/AlbumAlreadyPendingStep";
import { getMood } from "@/constants/moods";
import {
  AlbumSaveDestination,
  FavoriteFormat,
  ListenLaterAlbum,
  SaveAlbumResult,
} from "@/types/favorites";
import { useScrollLock } from "@/hooks/useScrollLock";
import { AnimatePresence, EASE_OUT, motion } from "@/components/motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  isFavorite?: boolean;
  isPending?: boolean;
  pendingData?: ListenLaterAlbum | null;
  onSaved?: (favoriteData: any) => void;
  onPendingSaved?: (pendingAlbum: ListenLaterAlbum | null) => void;
  onPendingRemoved?: () => void;
  favoriteData?: any;
  startEditing?: boolean;
  /** Abre directamente el formulario de colección para mover un pendiente. */
  startMovingToCollection?: boolean;
}
interface Moods {
  label: string;
  emoji: string;
}

export default function SelectedAlbumModal({
  isOpen,
  onClose,
  album,
  isFavorite = false,
  isPending = false,
  pendingData = null,
  onSaved,
  onPendingSaved,
  onPendingRemoved,
  favoriteData,
  startEditing = false,
  startMovingToCollection = false,
}: ModalProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [feelings, setFeelings] = useState<Array<Moods>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAsEdit, setSavedAsEdit] = useState(false);
  const [savedDestination, setSavedDestination] =
    useState<AlbumSaveDestination>("collection");
  const [forceCollection, setForceCollection] = useState(
    startMovingToCollection && isPending,
  );
  useScrollLock(isOpen);

  // Las claves guardadas son canónicas: resolvemos la marca (emoji/símbolo) del
  // catálogo para que la burbuja muestre la etiqueta traducida y no la clave.
  const savedFeelings = (favoriteData?.labeledFeelings || []).map(
    (feeling: any) => {
      const raw = typeof feeling === "string" ? feeling : feeling?.label;
      const match = getMood(raw);
      return {
        label: match?.key ?? raw,
        emoji:
          match?.emoji ??
          (typeof feeling === "object" ? feeling?.emoji : undefined) ??
          "🎵",
        symbol: match?.symbol,
      };
    },
  );

  useEffect(() => {
    if (isOpen) {
      setIsSaved(false);
      setIsEditing(startEditing);
      setSavedAsEdit(false);
      setSavedDestination("collection");
      setForceCollection(startMovingToCollection && isPending);
      setFeelings([]);
    }

    // Solo al abrir: cuando el padre actualiza `startEditing` después de
    // guardar, el modal debe pasar al éxito y no volver al paso de edición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stepKey = isSaved
    ? "success"
    : isFavorite && !isEditing && !forceCollection
      ? "favorite"
      : isPending && !isEditing && !forceCollection
        ? "pending"
        : "save";

  const handleSave = (savedData: SaveAlbumResult) => {
    setSavedDestination(savedData.destination);
    setSavedAsEdit(isEditing && savedData.destination === "collection");
    setIsSaved(true);
    setIsEditing(false);
    setForceCollection(false);

    if (savedData.destination === "pending") {
      onPendingSaved?.(savedData.listenLater ?? null);
      return;
    }

    onSaved?.({ ...savedData, labeledFeelings: savedData.feelings });
  };

  const handlePendingRemoved = () => {
    onPendingRemoved?.();
    onClose();
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
      >
        {isSaved ? (
          <SuccessModal
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            feelings={feelings}
            isEditing={savedAsEdit}
            destination={savedDestination}
            onPendingRemoved={onPendingRemoved}
          />
        ) : isFavorite && !isEditing && !forceCollection ? (
          <AlbumAlreadyFavoriteStep
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            feelings={savedFeelings}
            activities={favoriteData?.activities || []}
            onEdit={() => setIsEditing(true)}
          />
        ) : isPending && !isEditing && !forceCollection ? (
          <AlbumAlreadyPendingStep
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            pendingData={pendingData}
            onMoveToCollection={() => setForceCollection(true)}
            onRemoved={handlePendingRemoved}
          />
        ) : (
          <SaveAlbumModal
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            feelings={feelings}
            setFeelings={setFeelings}
            initialFeelings={isEditing ? savedFeelings : []}
            initialActivities={isEditing ? favoriteData?.activities || [] : []}
            initialFormat={
              isEditing
                ? ((Array.isArray(favoriteData?.format)
                    ? favoriteData.format
                    : [favoriteData?.format || "digital"]) as FavoriteFormat[])
                : ["digital"]
            }
            initialTags={isEditing ? favoriteData?.tags || [] : []}
            isEditing={isEditing}
            forceCollection={forceCollection}
            onSave={handleSave}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
