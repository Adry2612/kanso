/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "@/context/I18nContext";
import ArtistBackdrop from "./ArtistBackdrop";
import ModalShell from "@/components/ModalShell";
import { AnimatePresence, EASE_OUT, motion } from "@/components/motion";
import { SaveAlbumStepper } from "./SaveAlbumStepper";
import { SaveAlbumDestinationStep } from "./SaveAlbumDestinationStep";
import { SaveAlbumFeelingsStep } from "./SaveAlbumFeelingsStep";
import { SaveAlbumActivitiesStep } from "./SaveAlbumActivitiesStep";
import { SaveAlbumFormatStep } from "./SaveAlbumFormatStep";
import type { Album } from "@/types/album";
import type { Mood } from "@/types/mood";
import type { FavoriteFormat, FavoriteTag } from "@/types/favorites";

type SaveAlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  step: number;
  /** Primer paso: elegir destino. */
  showDestination: boolean;
  feelings: Mood[];
  activities: string[];
  format: FavoriteFormat[];
  tags: FavoriteTag[];
  isEditing: boolean;
  /** Hay un guardado en curso (colección o pendientes). */
  busy: boolean;
  savingPending: boolean;
  error: string | null;
  onFeelingsChange: (moods: Mood[]) => void;
  onActivitiesChange: (activities: string[]) => void;
  onFormatChange: (format: FavoriteFormat[]) => void;
  onTagsChange: (tags: FavoriteTag[]) => void;
  onSelectCollection: () => void;
  onSelectPending: () => void;
  onNext: () => void;
  onBack: () => void;
};

/**
 * Asistente de guardado: solo compone los pasos presentacionales. El estado y
 * las acciones llegan desde `useSaveAlbumWizard`.
 */
export const SaveAlbumModal = ({
  isOpen,
  onClose,
  album,
  step,
  showDestination,
  feelings,
  activities,
  format,
  tags,
  isEditing,
  busy,
  savingPending,
  error,
  onFeelingsChange,
  onActivitiesChange,
  onFormatChange,
  onTagsChange,
  onSelectCollection,
  onSelectPending,
  onNext,
  onBack,
}: SaveAlbumModalProps) => {
  const t = useTranslations("modal");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cada paso empieza arriba: en móvil el contenido es más alto que el panel.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="save-album-modal"
      labelledBy="save-album-title"
      closeLabel={t("close")}
      hero={
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
      }
      heroBadge={isEditing ? t("editingBadge") : t("newAlbum")}
    >
      <div className="album-art-modal-body !pb-0">
        <div className="album-modal-album-row">
          <img
            loading="lazy"
            decoding="async"
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
              Álbum
            </p>
            <h2
              id="save-album-title"
              className="mt-1 line-clamp-2 text-2xl font-semibold tracking-[-.05em]"
            >
              {album.name}
            </h2>
            <p className="album-action-modal-muted mt-1 line-clamp-2 text-sm">
              {album.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        </div>

        {!showDestination && <SaveAlbumStepper step={step} />}
      </div>

      <div
        ref={scrollRef}
        className="album-action-modal-soft min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7"
      >
        {showDestination ? (
          <SaveAlbumDestinationStep
            busy={busy}
            savingPending={savingPending}
            onSelectCollection={onSelectCollection}
            onSelectPending={onSelectPending}
          />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              {step === 0 && (
                <SaveAlbumFeelingsStep
                  feelings={feelings}
                  onFeelingsChange={onFeelingsChange}
                />
              )}

              {step === 1 && (
                <SaveAlbumActivitiesStep
                  activities={activities}
                  onActivitiesChange={onActivitiesChange}
                />
              )}

              {step === 2 && (
                <SaveAlbumFormatStep
                  format={format}
                  tags={tags}
                  onFormatChange={onFormatChange}
                  onTagsChange={onTagsChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="border-t border-[var(--kanso-danger)]/20 bg-[var(--kanso-danger)]/10 px-5 py-3 text-xs text-[var(--kanso-danger)] sm:px-7"
        >
          {error}
        </p>
      )}

      {showDestination ? (
        <footer className="modal-shell-actions modal-shell-actions--roomy">
          <button
            type="button"
            onClick={onClose}
            className="modal-action-secondary"
          >
            {t("cancel")}
          </button>
        </footer>
      ) : (
        <footer className="modal-shell-actions modal-shell-actions--roomy">
          <button
            type="button"
            onClick={onBack}
            className="modal-action-secondary"
          >
            {step === 0 ? t("cancel") : "← Atrás"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={busy || (step === 2 && format.length === 0)}
            className="modal-action-primary"
          >
            {busy
              ? "Guardando..."
              : step < 2
                ? "Continuar →"
                : isEditing
                  ? t("saveChanges")
                  : "Guardar álbum"}
          </button>
        </footer>
      )}
    </ModalShell>
  );
};
