import React from "react";
import { useTransitionRouter } from "next-view-transitions";
import { Check, Plus } from "lucide-react";
import TagList from "./TagList";
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
  tags?: { category: string; value: string }[];
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onClick,
  onAdd,
  isFavorite = false,
  tags = [],
}) => {
  const router = useTransitionRouter();

  return (
    <motion.article
      key={album.id}
      onClick={onClick ? onClick : () => router.push(`/albums/${album.id}`)}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      style={{ transition: "border-color .2s ease, box-shadow .2s ease" }}
      className="collectify-card group w-full cursor-pointer p-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xs)]">
        <img
          src={album.images[0]?.url}
          alt={album.name}
          style={{ viewTransitionName: `album-cover-${album.id}` }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="px-2 pb-2 pt-3">
        <span className="block truncate text-sm font-semibold text-[#f2f5ef]">
          {album.name}
        </span>
        <span className="mt-1 block truncate text-xs text-[#8f9f93]">
          {album.artists[0]?.name}
        </span>
        <TagList tags={tags} />

        {onAdd && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xs)] border px-2 py-2 text-center text-xs font-semibold transition ${
              isFavorite
                ? "border-[#9be7a5]/60 bg-[#9be7a5]/15 text-[#9be7a5] hover:bg-[#9be7a5]/25"
                : "border-emerald-200/15 text-[#9be7a5] hover:border-[#9be7a5]/60 hover:bg-[#9be7a5]/10"
            }`}
          >
            {isFavorite ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
            ) : (
              <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
            )}
            <span>
              {isFavorite ? "Ya está en tu colección" : "Añadir a mi colección"}
            </span>
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default AlbumCard;
