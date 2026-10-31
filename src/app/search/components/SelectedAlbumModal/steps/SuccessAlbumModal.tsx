/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { LuUndo2 } from "react-icons/lu";
import { useTranslations } from "@/context/I18nContext";
import MoodBubble from "@/components/MoodBubble";
import ModalShell from "@/components/ModalShell";
import ArtistBackdrop from "./ArtistBackdrop";
import type { Album } from "@/types/album";
import type { Mood } from "@/types/mood";
import type { AlbumSaveDestination } from "@/types/collection";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  feelings: Mood[];
  isEditing?: boolean;
  destination?: AlbumSaveDestination;
  removing: boolean;
  onUndo: () => void;
}

export const SuccessModal = ({
  isOpen,
  onClose,
  album,
  feelings,
  isEditing = false,
  destination = "collection",
  removing,
  onUndo,
}: SuccessModalProps) => {
  const t = useTranslations("modal");
  const router = useRouter();
  const isPending = destination === "pending";

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="saved-album-title"
      closeLabel={t("close")}
      hero={
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
      }
      heroBadge={isPending ? t("pendingBadge") : "En tu colección"}
    >
      <div className="album-art-modal-body">
        <div className="album-modal-album-row border-b border-[var(--kanso-line)] pb-5">
          <img
            loading="lazy"
            decoding="async"
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="album-action-modal-eyebrow">
              {isPending
                ? t("pendingEyebrow")
                : isEditing
                  ? t("albumUpdated")
                  : "Álbum guardado"}
            </p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-[-.05em]">
              {album.name}
            </h2>
            <p className="album-action-modal-muted mt-1 truncate text-sm">
              {album.artists.map((artist) => artist.name).join(", ")}
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-3">
          <div className="album-action-modal-success-mark">
            <FaRegCheckCircle />
          </div>
          <div>
            <p className="album-action-modal-eyebrow">
              {isPending ? t("pendingBadge") : "Colección actualizada"}
            </p>
            <h2
              id="saved-album-title"
              className="mt-1 text-2xl font-semibold tracking-[-.06em]"
            >
              {t(
                isPending
                  ? "pendingSuccess"
                  : isEditing
                    ? "updated"
                    : "success",
              )}
            </h2>
            <p className="album-action-modal-muted mt-1 text-sm">
              {t(
                isPending
                  ? "savedToListenLater"
                  : isEditing
                    ? "updatedToCollection"
                    : "savedToCollection",
              )}
            </p>
          </div>
        </div>
        {!isPending && feelings.length > 0 && (
          <div className="mt-6 border-t border-[var(--kanso-line)] pt-5">
            <p className="text-sm font-semibold">{t("relatedEmotions")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {feelings.map((feeling) => (
                <MoodBubble mood={feeling} key={feeling.label} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="modal-shell-actions modal-shell-actions--roomy">
        <button className="modal-action-secondary" onClick={onClose}>
          {isPending || isEditing ? t("close") : t("addAnother")}
        </button>
        <button
          className="modal-action-primary"
          onClick={() =>
            router.push(
              isPending ? "/collection?tab=listen-later" : "/collection",
            )
          }
        >
          {t(isPending ? "viewListenLater" : "viewCollection")}
        </button>
      </div>
      {!isEditing && (
        <div className="modal-shell-undo">
          <button
            className="modal-action-danger w-auto px-4 py-2 text-xs"
            disabled={removing}
            onClick={onUndo}
          >
            <LuUndo2 />
            {removing ? "Quitando..." : t("undo")}
          </button>
        </div>
      )}
    </ModalShell>
  );
};
