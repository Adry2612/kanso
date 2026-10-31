type GalleryGroupHeaderProps = {
  label: string;
  count: number;
  countLabel: string;
};

export default function GalleryGroupHeader({
  label,
  count,
  countLabel,
}: GalleryGroupHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-[var(--kanso-line)] pb-3">
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--kanso-mint)]" />
        <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
          {label}
        </h2>
      </div>
      <span className="text-xs text-[var(--kanso-muted)]">
        {count} {countLabel}
      </span>
    </div>
  );
}
