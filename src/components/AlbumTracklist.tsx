"use client";

import { useTranslations } from "@/context/I18nContext";
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
};

export default function AlbumTracklist({
  tracks,
  loading = false,
}: AlbumTracklistProps) {
  const t = useTranslations("album");

  if (loading) {
    return <div className="mt-8 text-sm text-[#8f9f93]">{t("loading")}</div>;
  }

  if (tracks === null) {
    return null;
  }

  if (tracks.length === 0) {
    return <div className="mt-8 text-sm text-[#8f9f93]">{t("noTracks")}</div>;
  }

  return (
    <div className="mt-10 max-w-2xl">
      <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
        {t("tracklist")}{" "}
        <span className="text-xs font-normal text-[#8f9f93]">
          · {tracks.length} pistas
        </span>
      </h2>
      <Stagger className="border-t border-emerald-100/10" stagger={0.03}>
        {tracks.map((track, index) => (
          <StaggerItem key={index} y={12}>
            <div className="grid grid-cols-[30px_1fr] items-center gap-3 border-b border-emerald-100/10 px-1 py-3 transition-colors hover:bg-white/[0.03]">
              <span className="text-xs text-[#8f9f93]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm text-[#b4c2b6]">
                  {track.name}
                </span>
                <span className="mt-1 truncate text-xs text-[#8f9f93]">
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
