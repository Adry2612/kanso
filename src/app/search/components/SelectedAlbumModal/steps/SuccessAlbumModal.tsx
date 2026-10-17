/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { LuUndo2 } from "react-icons/lu";
import { Album } from "../../../../../../models/album";
import { useFetch } from "@/hooks/useFetch";
import { undoFavorite } from "@/lib/api/favorites";
import { useTranslations } from "@/context/I18nContext";
import MoodBubble from "@/components/MoodBubble";
import ModalShell from "@/components/ModalShell";
import ArtistBackdrop from "./ArtistBackdrop";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  feelings: string[];
}

export const SuccessModal = ({
  isOpen,
  onClose,
  album,
  feelings,
}: SuccessModalProps) => {
  const t = useTranslations("modal");
  const router = useRouter();
  const { execute: removeFavorite, loading } = useFetch(undoFavorite);

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
      heroBadge="En tu colección"
    >
      <div className="album-art-modal-body">
        <div className="album-modal-album-row border-b border-[var(--collectify-line)] pb-5">
          <img
            loading="lazy"
            decoding="async"
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="album-action-modal-eyebrow">Álbum guardado</p>
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
            <p className="album-action-modal-eyebrow">Colección actualizada</p>
            <h2
              id="saved-album-title"
              className="mt-1 text-2xl font-semibold tracking-[-.06em]"
            >
              {t("success")}
            </h2>
            <p className="album-action-modal-muted mt-1 text-sm">
              {t("savedToFavorites")}
            </p>
          </div>
        </div>
        {feelings.length > 0 && (
          <div className="mt-6 border-t border-[var(--collectify-line)] pt-5">
            <p className="text-sm font-semibold">{t("relatedEmotions")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {feelings.map((feeling: string) => (
                <MoodBubble moodKey={feeling} key={feeling} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="modal-shell-actions">
        <button className="modal-action-secondary" onClick={onClose}>
          {t("addAnother")}
        </button>
        <button
          className="modal-action-primary"
          onClick={() => router.push("/favorites")}
        >
          {t("viewCollection")}
        </button>
      </div>
      <button
        className="modal-action-danger mx-auto my-4 w-auto px-4 py-2 text-xs"
        disabled={loading}
        onClick={() => removeFavorite(album).then(() => onClose())}
      >
        <LuUndo2 />
        {loading ? "Quitando..." : t("undo")}
      </button>
    </ModalShell>
  );
};
