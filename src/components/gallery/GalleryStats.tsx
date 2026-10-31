import type { LucideIcon } from "lucide-react";

export type GalleryStat = {
  id: string;
  icon: LucideIcon;
  value: number;
  label: string;
};

type GalleryStatsProps = {
  stats: GalleryStat[];
};

export default function GalleryStats({ stats }: GalleryStatsProps) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--kanso-muted)]">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <span key={stat.id} className="contents">
            {index > 0 && (
              <span
                className="hidden h-3 w-px bg-[var(--kanso-line)] sm:block"
                aria-hidden="true"
              />
            )}
            <span className="inline-flex items-center gap-1.5">
              <Icon
                className="h-3.5 w-3.5 text-[var(--kanso-mint)]"
                aria-hidden="true"
              />
              <strong className="font-semibold text-[var(--foreground)]">
                {stat.value}
              </strong>
              {stat.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
