import { BiSortAlt2 } from "react-icons/bi";
import type { FavoriteFormat, FavoriteTag } from "@/types/favorites";

type FavoritesActiveFiltersProps = {
  sortLabel: string | null;
  genres: string[];
  formats: FavoriteFormat[];
  tags: FavoriteTag[];
  genreLabel: (genre: string) => string;
  formatLabel: (format: FavoriteFormat) => string;
  tagCategoryLabel: (category: string) => string;
  tagRemoveLabel: (tag: FavoriteTag) => string;
  onClearSort: () => void;
  onRemoveGenre: (genre: string) => void;
  onRemoveFormat: (format: FavoriteFormat) => void;
  onRemoveTag: (tag: FavoriteTag) => void;
};

export default function FavoritesActiveFilters({
  sortLabel,
  genres,
  formats,
  tags,
  genreLabel,
  formatLabel,
  tagCategoryLabel,
  tagRemoveLabel,
  onClearSort,
  onRemoveGenre,
  onRemoveFormat,
  onRemoveTag,
}: FavoritesActiveFiltersProps) {
  if (
    !sortLabel &&
    genres.length === 0 &&
    formats.length === 0 &&
    tags.length === 0
  ) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {sortLabel && (
        <span className="flex items-center gap-2 rounded-full border border-green-400/30 bg-green-900/30 px-3 py-1 text-sm text-green-400">
          <BiSortAlt2 size={16} />
          {sortLabel}
          <button
            type="button"
            onClick={onClearSort}
            className="transition-colors hover:text-red-400"
          >
            ✕
          </button>
        </span>
      )}
      {genres.map((genre) => (
        <span
          key={genre}
          className="flex items-center gap-2 rounded-full border border-green-400/30 bg-green-900/30 px-3 py-1 text-sm text-green-400"
        >
          {genreLabel(genre)}
          <button
            type="button"
            onClick={() => onRemoveGenre(genre)}
            className="transition-colors hover:text-red-400"
          >
            ✕
          </button>
        </span>
      ))}
      {formats.map((format) => (
        <span
          key={format}
          className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--kanso-mint)]"
        >
          {formatLabel(format)}
          <button
            type="button"
            onClick={() => onRemoveFormat(format)}
            className="hover:text-[var(--kanso-danger)]"
          >
            ✕
          </button>
        </span>
      ))}
      {tags.map((tag) => (
        <span
          key={`${tag.category}:${tag.value}`}
          className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--kanso-mint)]"
        >
          <span className="text-xs uppercase tracking-[.1em] text-[var(--kanso-muted)]">
            {tagCategoryLabel(tag.category)}
          </span>
          {tag.value}
          <button
            type="button"
            onClick={() => onRemoveTag(tag)}
            className="hover:text-[var(--kanso-danger)]"
            aria-label={tagRemoveLabel(tag)}
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}
