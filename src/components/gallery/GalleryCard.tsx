import type { ReactNode } from "react";
import { Clock3, Headphones } from "lucide-react";
import { Link } from "next-view-transitions";
import AlbumCover from "@/components/AlbumCover";

type GalleryCardProps = {
  href: string;
  image?: string;
  title: string;
  artist: string;
  timestampLabel?: string;
  /**
   * Insignias sobre la portada. Recibe cuántas emociones mostrar: la tarjeta
   * pide una en móvil y dos desde `sm`, y el llamador decide el contador.
   */
  badges?: (max: number) => ReactNode;
  footer?: ReactNode;
  listenLabel: string;
  onListen: () => void;
};

export default function GalleryCard({
  href,
  image,
  title,
  artist,
  timestampLabel,
  badges,
  footer,
  listenLabel,
  onListen,
}: GalleryCardProps) {
  return (
    <article className="group min-w-0">
      <AlbumCover src={image} alt={title} scrim="soft">
        <Link
          href={href}
          className="absolute inset-0 z-10"
          aria-label={title}
        />
        {timestampLabel && (
          <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            {timestampLabel}
          </span>
        )}
        {badges && (
          <>
            <div className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-wrap gap-1 pr-12 sm:hidden">
              {badges(1)}
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden flex-wrap gap-1.5 pr-12 sm:flex">
              {badges(2)}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onListen}
          aria-label={listenLabel}
          className="absolute bottom-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition hover:bg-[var(--kanso-mint)] hover:text-[var(--background)]"
        >
          <Headphones className="h-4 w-4" aria-hidden="true" />
        </button>
      </AlbumCover>
      <div className="mt-3 min-w-0">
        <Link
          href={href}
          className="block truncate text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--kanso-mint)]"
        >
          {title}
        </Link>
        <p className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
          {artist}
        </p>
        {footer}
      </div>
    </article>
  );
}
