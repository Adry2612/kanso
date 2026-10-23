import type { FavoritesTab } from "@/types/favorites";

type FavoritesTabsProps = {
  activeTab: FavoritesTab;
  labels: { collection: string; listenLater: string; ariaLabel: string };
  onChange: (tab: FavoritesTab) => void;
};

export default function FavoritesTabs({
  activeTab,
  labels,
  onChange,
}: FavoritesTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={labels.ariaLabel}
      className="mb-8 flex gap-6 border-b border-[var(--kanso-line)]"
    >
      {(
        [
          ["collection", labels.collection],
          ["listenLater", labels.listenLater],
        ] as const
      ).map(([tab, label]) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
              active
                ? "border-[var(--kanso-mint)] text-[var(--kanso-mint)]"
                : "border-transparent text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
