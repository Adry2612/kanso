import React from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Check, Clock, Plus } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import AlbumCover from "./AlbumCover";
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
  isInCollection?: boolean;
  isPending?: boolean;
  /** Contenido adicional al final del bloque de texto. */
  footer?: React.ReactNode;
  /**
   * Composición de la tarjeta: `panel` (tarjeta con elevación) o `plain`
   * (sin panel, con la portada como pieza principal). El buscador usa `plain`.
   */
  variant?: "panel" | "plain";
  /** Clases extra para el contenedor de la tarjeta. */
  className?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onClick,
  onAdd,
  isInCollection = false,
  isPending = false,
  footer,
  variant = "panel",
  className,
}) => {
  const router = useTransitionRouter();
  const t = useTranslations("common");
  const isPlain = variant === "plain";

  return (
    <motion.article
      key={album.id}
      onClick={onClick ? onClick : () => router.push(`/albums/${album.id}`)}
      whileHover={isPlain ? undefined : { y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{ transition: "border-color .2s ease, box-shadow .2s ease" }}
      className={`group w-full cursor-pointer ${isPlain ? "" : "kanso-card p-2"} ${className ?? ""}`}
    >
      <AlbumCover
        src={album.images[0]?.url}
        alt={album.name}
        viewTransitionName={`album-cover-${album.id}`}
      />
      <div
        className={
          isPlain ? "mt-3 min-w-0" : "flex flex-1 flex-col px-2 pb-2 pt-3"
        }
      >
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
              isInCollection
                ? "border-[var(--kanso-mint)]/60 bg-[var(--kanso-mint)]/15 text-[var(--kanso-mint)] hover:bg-[var(--kanso-mint)]/25"
                : isPending
                  ? "border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 text-[var(--foreground)] hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                  : "border-[var(--kanso-line)] text-[var(--kanso-mint)] hover:border-[var(--kanso-mint)]/60 hover:bg-[var(--kanso-mint)]/10"
            }`}
          >
            {isInCollection ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : isPending ? (
              <Clock className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            )}
            <span>
              {isInCollection
                ? t("alreadyInCollection")
                : isPending
                  ? t("inListenLater")
                  : t("addToCollection")}
            </span>
          </button>
        )}

        {footer}
      </div>
    </motion.article>
  );
};

export default AlbumCard;
