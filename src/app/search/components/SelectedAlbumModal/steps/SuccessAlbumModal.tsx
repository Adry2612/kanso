/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { FaRegCheckCircle } from "react-icons/fa";
import { LuUndo2 } from "react-icons/lu";
import { Album } from "../../../../../../models/album";
import { useAuth } from "@/context/AuthContext";
import { useFetch } from "@/hooks/useFetch";
import { undoFavorite } from "@/lib/api/favorites";
import { useTranslations } from "@/context/I18nContext";
import MoodBubble from "@/components/MoodBubble";
import ArtistBackdrop from "./ArtistBackdrop";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  feelings: Array<any>;
}

export const SuccessModal = ({
  onClose,
  album,
  feelings,
}: SuccessModalProps) => {
  const t = useTranslations("modal");
  const { user } = useAuth();
  const router = useRouter();
  const { execute: removeFavorite, loading } = useFetch(undoFavorite);

  return (
    <section
      className="album-action-modal album-art-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-album-title"
    >
      <header className="album-art-modal-hero">
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
        <div className="album-art-modal-hero-content">
          <div className="flex items-start justify-between gap-4">
            <span className="relative z-10 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white/85 backdrop-blur">
              En tu colección
            </span>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-xl text-white/80 transition hover:bg-black/45 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      </header>
      <div className="album-art-modal-body">
        <div className="album-modal-album-row border-b border-emerald-100/10 pb-5">
          <img
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
          <div className="mt-6 border-t border-emerald-100/10 pt-5">
            <p className="text-sm font-semibold">{t("relatedEmotions")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {feelings.map((feeling: any) => (
                <MoodBubble mood={feeling} key={feeling.label} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="album-art-modal-actions">
        <button
          className="album-action-modal-secondary px-4 py-3"
          onClick={onClose}
        >
          {t("addAnother")}
        </button>
        <button
          className="album-action-modal-primary px-4 py-3"
          onClick={() => router.push("/favorites")}
        >
          {t("viewCollection")}
        </button>
      </div>
      <button
        className="album-action-modal-danger mx-auto mb-5 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition hover:bg-red-500/10 disabled:opacity-50"
        disabled={loading}
        onClick={() =>
          removeFavorite(album, user?.uid || "").then(() => onClose())
        }
      >
        <LuUndo2 />
        {loading ? "Quitando..." : t("undo")}
      </button>
    </section>
  );
};
