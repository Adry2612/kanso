import { LayoutGrid, List } from "lucide-react";

export type GalleryView = "grid" | "list";

type GalleryViewToggleProps = {
  view: GalleryView;
  onChange: (view: GalleryView) => void;
  labels: {
    viewList: string;
    viewGrid: string;
  };
  className?: string;
};

export default function GalleryViewToggle({
  view,
  onChange,
  labels,
  className = "",
}: GalleryViewToggleProps) {
  const next = view === "grid" ? "list" : "grid";
  const label = next === "grid" ? labels.viewGrid : labels.viewList;

  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-label={view === "grid" ? labels.viewList : labels.viewGrid}
      title={view === "grid" ? labels.viewList : labels.viewGrid}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] px-3 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)] ${className}`}
    >
      {view === "grid" ? (
        <List className="h-4 w-4" aria-hidden="true" />
      ) : (
        <LayoutGrid className="h-4 w-4" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
