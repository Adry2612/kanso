import { BiSortAlt2 } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import type { FavoritesTab, SortMethod } from "@/types/favorites";

type FavoritesHeaderProps = {
  activeTab: FavoritesTab;
  sortBy: SortMethod;
  activeFilterCount: number;
  labels: {
    eyebrow: string;
    title: string;
    sort: string;
    filter: string;
  };
  onOpenSort: () => void;
  onOpenFilter: () => void;
};

export default function FavoritesHeader({
  activeTab,
  sortBy,
  activeFilterCount,
  labels,
  onOpenSort,
  onOpenFilter,
}: FavoritesHeaderProps) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-5 text-[var(--foreground)] md:flex-row md:items-end">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
          {labels.eyebrow}
        </p>
        <span className="mt-3 block text-5xl font-semibold tracking-tight text-[var(--foreground)]">
          {labels.title}
        </span>
      </div>

      {activeTab === "collection" && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onOpenSort}
            className="relative flex flex-row items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)] px-4 py-2 text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
          >
            <BiSortAlt2 size={20} />
            {labels.sort}
            {sortBy && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400" />
            )}
          </button>
          <button
            type="button"
            onClick={onOpenFilter}
            className="relative flex flex-row items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)] px-4 py-2 text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
          >
            <MdFilterList size={20} />
            {labels.filter}
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-xs font-bold text-[var(--background)]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
