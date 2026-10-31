/* eslint-disable @next/next/no-img-element */
"use client";

import { IoTrash } from "react-icons/io5";
import { useTranslations } from "@/context/I18nContext";
import ModalShell from "@/components/ModalShell";
import ArtistBackdrop from "./ArtistBackdrop";
import type { Album } from "@/types/album";
import type { ListenLaterItem } from "@/types/collection";

interface AlbumAlreadyPendingStepProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  pendingData?: ListenLaterItem | null;
  removing: boolean;
  error: string | null;
  onMoveToCollection: () => void;
  onRemove: () => void;
}

/** Resumen de un álbum que ya está en pendientes. */
export const AlbumAlreadyPendingStep = ({
  isOpen,
  onClose,
  album,
  pendingData,
  removing,
  error,
  onMoveToCollection,
  onRemove,
}: AlbumAlreadyPendingStepProps) => {
  const t = useTranslations("modal");

  const addedAt = pendingData?.addedAt ? new Date(pendingData.addedAt) : null;
  const addedAtLabel =
    addedAt && !Number.isNaN(addedAt.getTime())
      ? addedAt.toLocaleDateString()
      : null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="pending-album-title"
      closeLabel={t("close")}
      hero={
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
      }
      heroBadge={t("pendingBadge")}
    >
      <div className="album-art-modal-body">
        <div className="album-modal-album-row">
          <img
            loading="lazy"
            decoding="async"
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="album-action-modal-eyebrow">{t("pendingEyebrow")}</p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-[-.05em]">
              {album.name}
            </h2>
            <p className="album-action-modal-muted mt-1 truncate text-sm">
              {album.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h3
            id="pending-album-title"
            className="mt-5 text-xl font-semibold tracking-[-.05em]"
          >
            {t("pendingTitle")}
          </h3>
          <p className="album-action-modal-muted mt-3 text-sm leading-6">
            {t("pendingDescription")}
          </p>
          {addedAtLabel && (
            <p className="album-action-modal-muted mt-3 text-xs">
              {t("pendingAddedOn")} {addedAtLabel}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="border-t border-[var(--kanso-danger)]/20 bg-[var(--kanso-danger)]/10 px-5 py-3 text-xs text-[var(--kanso-danger)] sm:px-7"
        >
          {error}
        </p>
      )}

      <div className="modal-shell-actions modal-shell-actions--roomy">
        <button
          type="button"
          onClick={onMoveToCollection}
          className="modal-action-primary"
        >
          {t("moveToCollection")}
        </button>
        <button
          type="button"
          disabled={removing}
          onClick={onRemove}
          className="modal-action-danger"
        >
          <IoTrash />
          {removing ? t("removing") : t("removeFromPending")}
        </button>
      </div>
    </ModalShell>
  );
};
