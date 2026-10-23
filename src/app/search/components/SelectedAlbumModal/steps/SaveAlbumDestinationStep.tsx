"use client";

import { Clock, Library } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";

interface SaveAlbumDestinationStepProps {
  /** Hay un guardado en curso (colección o pendientes). */
  busy: boolean;
  savingPending: boolean;
  onSelectCollection: () => void;
  onSelectPending: () => void;
}

/** Primer paso: elegir si el álbum va a la colección o a pendientes. */
export function SaveAlbumDestinationStep({
  busy,
  savingPending,
  onSelectCollection,
  onSelectPending,
}: SaveAlbumDestinationStepProps) {
  const t = useTranslations("modal");

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        {t("destinationEyebrow")}
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
        {t("destinationTitle")}
      </h3>
      <p className="album-action-modal-muted mt-2 text-sm">
        {t("destinationDescription")}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onSelectCollection}
          className="save-album-modal-option flex h-full flex-col items-start gap-3 rounded-xl p-4 text-left transition"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanso-line)] text-[var(--kanso-mint)]">
            <Library className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--foreground)]">
              {t("destinationCollection")}
            </span>
            <span className="album-action-modal-muted mt-1 hidden text-xs leading-5 sm:block">
              {t("destinationCollectionDescription")}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onSelectPending}
          disabled={busy}
          className="save-album-modal-option flex h-full flex-col items-start gap-3 rounded-xl p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanso-line)] text-[var(--kanso-mint)]">
            <Clock className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-[var(--foreground)]">
              {savingPending ? t("saving") : t("destinationPending")}
            </span>
            <span className="album-action-modal-muted mt-1 hidden text-xs leading-5 sm:block">
              {t("destinationPendingDescription")}
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
