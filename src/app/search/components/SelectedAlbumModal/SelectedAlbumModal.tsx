/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Album } from "../../../../../models/album";
import { SuccessModal } from "./steps/SuccessAlbumModal";
import { SaveAlbumModal } from "./steps/SaveAlbumModal";
import { AlbumAlreadyFavoriteStep } from "./steps/AlbumAlreadyFavoriteStep";
import { musicalFeelings } from "@/constants/feelings";
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

  const savedFeelings = (favoriteData?.labeledFeelings || []).map(
    (feeling: any) => {
      const label = typeof feeling === "string" ? feeling : feeling.label;
      const match = musicalFeelings.find((item) => item.nombre === label);
      return {
        label,
        emoji:
          typeof feeling === "string"
            ? match?.emoji || "🎵"
            : feeling.emoji || match?.emoji || "🎵",
        symbol: match?.symbol || feeling.symbol,
      };
    },
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsSaved(false);
      setIsEditing(startEditing);
      setFeelings([]);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, startEditing]);

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
            onSave={(savedData) => {
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
