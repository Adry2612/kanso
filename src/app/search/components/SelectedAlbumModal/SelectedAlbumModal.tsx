/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Album } from "../../../../../models/album";
import { SuccessModal } from "./steps/SuccessAlbumModal";
import { SaveAlbumModal } from "./steps/SaveAlbumModal";
import { AlbumAlreadyFavoriteStep } from "./steps/AlbumAlreadyFavoriteStep";
import { getMood } from "@/constants/moods";
import { FavoriteFormat } from "@/types/favorites";
import { AnimatePresence, EASE_OUT, motion } from "@/components/motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  isFavorite?: boolean;
  onSaved?: (favoriteData: any) => void;
  favoriteData?: any;
  startEditing?: boolean;
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
  onSaved,
  favoriteData,
  startEditing = false,
}: ModalProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [feelings, setFeelings] = useState<Array<Moods>>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [savedAsEdit, setSavedAsEdit] = useState(false);

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
      document.body.style.overflow = "hidden";
      setIsSaved(false);
      setIsEditing(startEditing);
      setSavedAsEdit(false);
      setFeelings([]);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
    // Solo al abrir: cuando el padre actualiza `startEditing` después de
    // guardar, el modal debe pasar al éxito y no volver al paso de edición.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stepKey = isSaved
    ? "success"
    : isFavorite && !isEditing
      ? "favorite"
      : "save";

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
          />
        ) : isFavorite && !isEditing ? (
          <AlbumAlreadyFavoriteStep
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            feelings={savedFeelings}
            activities={favoriteData?.activities || []}
            onEdit={() => setIsEditing(true)}
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
            onSave={(savedData) => {
              setSavedAsEdit(isEditing);
              setIsSaved(true);
              setIsEditing(false);
              onSaved?.(
                savedData || {
                  albumId: album.id,
                  labeledFeelings: feelings,
                },
              );
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
