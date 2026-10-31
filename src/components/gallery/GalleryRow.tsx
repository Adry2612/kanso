import type { ReactNode } from "react";
import { Clock3, Headphones } from "lucide-react";
import { Link } from "next-view-transitions";
import AlbumCover from "@/components/AlbumCover";

type GalleryRowProps = {
  href: string;
  image?: string;
  title: string;
  artist: string;
  timestampLabel?: string;
  badges?: ReactNode;
  footer?: ReactNode;
  listenLabel: string;
  onListen: () => void;
};

export default function GalleryRow({
  href,
  image,
  title,
  artist,
  timestampLabel,
  badges,
  footer,
  listenLabel,
  onListen,
}: GalleryRowProps) {
  return (
    <article className="group flex items-center gap-3 py-3.5 sm:gap-4">
      <Link href={href} className="shrink-0" aria-label={title}>
        <AlbumCover
          src={image}
          alt={title}
          className="h-14 w-14 rounded-xl sm:h-16 sm:w-16"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={href}
          className="block truncate text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--kanso-mint)]"
        >
          {title}
        </Link>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--kanso-muted)]">
          <span className="truncate">{artist}</span>
          {timestampLabel && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex shrink-0 items-center gap-1">
                <Clock3 className="h-3 w-3" aria-hidden="true" />
                {timestampLabel}
              </span>
            </>
          )}
        </p>
        {badges && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">{badges}</div>
        )}
        {footer}
      </div>
      <button
        type="button"
        onClick={onListen}
        aria-label={listenLabel}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanso-line)] text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
      >
        <Headphones className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
