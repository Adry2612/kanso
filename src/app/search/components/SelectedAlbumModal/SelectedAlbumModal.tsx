/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { Album } from "../../../../../models/album";
import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-fit"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
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
                    initialActivities={
                      isEditing ? favoriteData?.activities || [] : []
                    }
                    initialFormat={
                      isEditing
                        ? ((Array.isArray(favoriteData?.format)
                            ? favoriteData.format
                            : [
                                favoriteData?.format || "digital",
                              ]) as FavoriteFormat[])
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
