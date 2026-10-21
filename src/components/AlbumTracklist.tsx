"use client";

import { useTranslations } from "@/context/I18nContext";
import { Skeleton } from "@/components/Skeleton";
import { Stagger, StaggerItem } from "./motion";

/**
 * Minimal track shape shared by the album detail page (local Track type) and
 * Spotify's track payload, so either can be rendered here.
 */
type TrackListItem = {
  name: string;
  track_number: number;
  artists: { name: string }[];
};

type AlbumTracklistProps = {
  tracks: TrackListItem[] | null;
  loading?: boolean;
  className?: string;
};

export default function AlbumTracklist({
  tracks,
  loading = false,
  className = "mt-10 max-w-2xl",
}: AlbumTracklistProps) {
  const t = useTranslations("album");

  if (loading) {
    return (
      <div className={className} aria-busy="true">
        <span className="sr-only">{t("loading")}</span>
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="border-t border-[var(--kanso-line)]">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-[30px_1fr] items-center gap-3 border-b border-[var(--kanso-line)] px-1 py-3"
            >
              <Skeleton className="h-3 w-4" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-2.5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tracks === null) {
    return null;
  }

  if (tracks.length === 0) {
    return (
      <div className="mt-8 text-sm text-[var(--kanso-muted)]">
        {t("noTracks")}
      </div>
    );
  }

  return (
    <div className={className}>
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {t("tracklist")}{" "}
        <span className="text-xs font-normal text-[var(--kanso-muted)]">
          · {tracks.length} pistas
        </span>
      </h2>
      <Stagger
        className="border-t border-[var(--kanso-line)]"
        stagger={0.03}
        onMount
      >
        {tracks.map((track, index) => (
          <StaggerItem key={index} y={12}>
            <div className="grid grid-cols-[30px_1fr] items-center gap-3 border-b border-[var(--kanso-line)] px-1 py-3 transition-colors hover:bg-[var(--surface-2)]">
              <span className="text-xs text-[var(--kanso-muted)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-[var(--kanso-muted)]">
                  {track.name}
                </span>
                <span className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </span>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
