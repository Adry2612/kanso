import { BiSortAlt2 } from "react-icons/bi";
import type { CollectionFormat, CollectionTag } from "@/types/collection";

type CollectionActiveFiltersProps = {
  sortLabel: string | null;
  groupLabel: string | null;
  incomplete: boolean;
  incompleteLabel: string;
  removeLabel: string;
  genres: string[];
  formats: CollectionFormat[];
  tags: CollectionTag[];
  genreLabel: (genre: string) => string;
  formatLabel: (format: CollectionFormat) => string;
  tagCategoryLabel: (category: string) => string;
  tagRemoveLabel: (tag: CollectionTag) => string;
  onClearSort: () => void;
  onClearGroup: () => void;
  onClearIncomplete: () => void;
  onRemoveGenre: (genre: string) => void;
  onRemoveFormat: (format: CollectionFormat) => void;
  onRemoveTag: (tag: CollectionTag) => void;
};

export default function CollectionActiveFilters({
  sortLabel,
  groupLabel,
  incomplete,
  incompleteLabel,
  removeLabel,
  onClearGroup,
  onClearIncomplete,
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
}: CollectionActiveFiltersProps) {
  if (
    !sortLabel &&
    !groupLabel &&
    !incomplete &&
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
      {groupLabel && (
        <span className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--kanso-mint)]">
          {groupLabel}
          <button
            type="button"
            onClick={onClearGroup}
            aria-label={`${groupLabel} · ${removeLabel}`}
            className="transition-colors hover:text-red-400"
          >
            ✕
          </button>
        </span>
      )}
      {incomplete && (
        <span className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--kanso-mint)]">
          {incompleteLabel}
          <button
            type="button"
            onClick={onClearIncomplete}
            aria-label={`${incompleteLabel} · ${removeLabel}`}
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
