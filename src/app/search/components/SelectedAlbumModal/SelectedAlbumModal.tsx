"use client";

import { AnimatePresence, EASE_OUT, motion } from "@/components/motion";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useSaveAlbumWizard } from "@/hooks/client/useSaveAlbumWizard";
import { SuccessModal } from "./steps/SuccessAlbumModal";
import { SaveAlbumModal } from "./steps/SaveAlbumModal";
import { AlbumAlreadyFavoriteStep } from "./steps/AlbumAlreadyFavoriteStep";
import { AlbumAlreadyPendingStep } from "./steps/AlbumAlreadyPendingStep";
import type { Album } from "@/types/album";
import type {
  CollectionFavorite,
  ListenLaterItem,
  SaveAlbumResult,
} from "@/types/favorites";

interface SelectedAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  isFavorite?: boolean;
  isPending?: boolean;
  pendingData?: ListenLaterItem | null;
  onSaved?: (result: SaveAlbumResult) => void;
  onPendingSaved?: (pending: ListenLaterItem | null) => void;
  onPendingRemoved?: () => void;
  favoriteData?: CollectionFavorite | null;
  startEditing?: boolean;
  /** Abre directamente el formulario de colección para mover un pendiente. */
  startMovingToCollection?: boolean;
}

/**
 * Modal de un álbum: delega todo el flujo en `useSaveAlbumWizard` y elige el
 * paso que corresponde. Los pasos solo pintan estado y disparan acciones.
 */
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
  favoriteData = null,
  startEditing = false,
  startMovingToCollection = false,
}: SelectedAlbumModalProps) {
  const wizard = useSaveAlbumWizard({
    isOpen,
    album,
    isFavorite,
    isPending,
    pendingData,
    favoriteData,
    startEditing,
    startMovingToCollection,
    onSaved,
    onPendingSaved,
    onPendingRemoved,
    onClose,
  });
  useScrollLock(isOpen);

  const stepKey =
    wizard.stage === "success" ||
    wizard.stage === "favorite" ||
    wizard.stage === "pending"
      ? wizard.stage
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
        {wizard.stage === "success" && (
          <SuccessModal
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            feelings={wizard.feelings}
            isEditing={wizard.savedAsEdit}
            destination={wizard.savedDestination}
            removing={wizard.isRemoving}
            onUndo={wizard.undo}
          />
        )}

        {wizard.stage === "favorite" && (
          <AlbumAlreadyFavoriteStep
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            feelings={wizard.savedFeelings}
            activities={favoriteData?.activities ?? []}
            removing={wizard.isRemoving}
            onEdit={wizard.edit}
            onRemove={wizard.deleteFromCollection}
          />
        )}

        {wizard.stage === "pending" && (
          <AlbumAlreadyPendingStep
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            pendingData={pendingData}
            removing={wizard.isRemoving}
            error={wizard.error}
            onMoveToCollection={wizard.moveToCollection}
            onRemove={wizard.deleteFromPending}
          />
        )}

        {(wizard.stage === "destination" || wizard.stage === "steps") && (
          <SaveAlbumModal
            isOpen={isOpen}
            onClose={onClose}
            album={album}
            step={wizard.step}
            showDestination={wizard.stage === "destination"}
            feelings={wizard.feelings}
            activities={wizard.activities}
            format={wizard.format}
            tags={wizard.tags}
            isEditing={wizard.isEditing}
            busy={wizard.isSaving || wizard.isSavingPending}
            savingPending={wizard.isSavingPending}
            error={wizard.error}
            onFeelingsChange={wizard.setFeelings}
            onActivitiesChange={wizard.setActivities}
            onFormatChange={wizard.setFormat}
            onTagsChange={wizard.setTags}
            onSelectCollection={wizard.chooseCollection}
            onSelectPending={wizard.saveToListenLater}
            onNext={wizard.goNext}
            onBack={wizard.goBack}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
