/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { LuUndo2 } from "react-icons/lu";
import { Album } from "../../../../../../models/album";
import { useFetch } from "@/hooks/useFetch";
import { undoFavorite } from "@/lib/api/favorites";
import { removeFromListenLater } from "@/lib/api/listenLater";
import { useTranslations } from "@/context/I18nContext";
import MoodBubble from "@/components/MoodBubble";
import ModalShell from "@/components/ModalShell";
import type { AlbumSaveDestination } from "@/types/favorites";
import ArtistBackdrop from "./ArtistBackdrop";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  feelings: Array<any>;
  isEditing?: boolean;
  destination?: AlbumSaveDestination;
  onPendingRemoved?: () => void;
}

export const SuccessModal = ({
  isOpen,
  onClose,
  album,
  feelings,
  isEditing = false,
  destination = "collection",
  onPendingRemoved,
}: SuccessModalProps) => {
  const t = useTranslations("modal");
  const router = useRouter();
  const { execute: removeFavorite, loading: removingFavorite } =
    useFetch(undoFavorite);
  const { execute: removePending, loading: removingPending } = useFetch(
    removeFromListenLater,
  );
  const isPending = destination === "pending";
  const loading = isPending ? removingPending : removingFavorite;

  const undo = async () => {
    if (isPending) {
      const result = await removePending(album);
      if (result !== null) {
        onPendingRemoved?.();
        onClose();
      }
      return;
    }

    await removeFavorite(album);
    onClose();
  };

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
              {album.artists.map((artist: any) => artist.name).join(", ")}
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
                    ? "updatedToFavorites"
                    : "savedToFavorites",
              )}
            </p>
          </div>
        </div>
        {!isPending && feelings.length > 0 && (
          <div className="mt-6 border-t border-[var(--kanso-line)] pt-5">
            <p className="text-sm font-semibold">{t("relatedEmotions")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {feelings.map((feeling: any) => (
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
              isPending ? "/favorites?tab=listen-later" : "/favorites",
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
            disabled={loading}
            onClick={undo}
          >
            <LuUndo2 />
            {loading ? "Quitando..." : t("undo")}
          </button>
        </div>
      )}
    </ModalShell>
  );
};
