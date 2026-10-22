/* eslint-disable @next/next/no-img-element -- portadas del CDN de Spotify; la optimización de imágenes se decide en improve-performance */
import React from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Check, Clock, Plus } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { motion } from "./motion";

interface AlbumCardProps {
  album: {
    id: string;
    name: string;
    images: { url: string }[];
    artists: { name: string }[];
  };
  onClick?: () => void;
  onAdd?: () => void;
  isFavorite?: boolean;
  isPending?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onClick,
  onAdd,
  isFavorite = false,
  isPending = false,
}) => {
  const router = useTransitionRouter();
  const t = useTranslations("common");

  return (
    <motion.article
      key={album.id}
      onClick={onClick ? onClick : () => router.push(`/albums/${album.id}`)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{ transition: "border-color .2s ease, box-shadow .2s ease" }}
      className="kanso-card group w-full cursor-pointer p-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xs)]">
        <img
          loading="lazy"
          decoding="async"
          src={album.images[0]?.url}
          alt={album.name}
          style={{ viewTransitionName: `album-cover-${album.id}` }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="px-2 pb-2 pt-3">
        <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
          {album.name}
        </span>
        <span className="mt-1 block truncate text-xs text-[var(--kanso-muted)]">
          {album.artists[0]?.name}
        </span>

        {onAdd && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xs)] border px-2 py-2 text-center text-xs font-semibold transition ${
              isFavorite
                ? "border-[var(--kanso-mint)]/60 bg-[var(--kanso-mint)]/15 text-[var(--kanso-mint)] hover:bg-[var(--kanso-mint)]/25"
                : isPending
                  ? "border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 text-[var(--foreground)] hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                  : "border-[var(--kanso-line)] text-[var(--kanso-mint)] hover:border-[var(--kanso-mint)]/60 hover:bg-[var(--kanso-mint)]/10"
            }`}
          >
            {isFavorite ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : isPending ? (
              <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            )}
            <span>
              {isFavorite
                ? t("alreadyInCollection")
                : isPending
                  ? t("inListenLater")
                  : t("addToCollection")}
            </span>
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default AlbumCard;
