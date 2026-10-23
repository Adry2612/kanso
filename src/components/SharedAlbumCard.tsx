/* eslint-disable @next/next/no-img-element -- portadas del CDN de Spotify */
"use client";

import { Music2 } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { openSpotify } from "@/lib/spotifyUtils";
import type { SharedCollectionAlbum } from "@/types/friends";
import { getMood } from "@/constants/moods";
import { getActivity } from "@/constants/activities";
import InlineEmoji from "@/components/InlineEmoji";

interface SharedAlbumCardProps {
  item: SharedCollectionAlbum;
}

/**
 * Tarjeta de solo lectura para un álbum de la biblioteca de otra persona.
 *
 * No muestra etiquetas personales ni ofrece acciones de edición: la colección
 * ajena se consulta, no se modifica.
 */
export default function SharedAlbumCard({ item }: SharedAlbumCardProps) {
  const t = useTranslations("friends");
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");

  if (!item.album) return null;

  const album = item.album;

  return (
    <article className="kanso-card flex h-full w-full flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xs)] bg-[var(--surface-3)]">
        {album.images[0]?.url ? (
          <img
            loading="lazy"
            decoding="async"
            src={album.images[0].url}
            alt={album.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[var(--kanso-muted)]">
            <Music2 className="h-8 w-8" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {album.name}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
          {album.artists.map((artist) => artist.name).join(" · ")}
        </p>

        {(item.labeledFeelings.length > 0 || item.activities.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.labeledFeelings.map((mood) => (
              <span
                key={`mood-${mood}`}
                className="rounded-full bg-[var(--kanso-mint)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-mint)]"
              >
                <InlineEmoji emoji={getMood(mood)?.emoji} />
                {tMoods(mood)}
              </span>
            ))}
            {item.activities.map((activity) => (
              <span
                key={`activity-${activity}`}
                className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--kanso-muted)]"
              >
                <InlineEmoji emoji={getActivity(activity)?.emoji} />
                {tActivities(activity)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          {item.format.map((format) => (
            <span
              key={format}
              className="rounded-full border border-[var(--kanso-line)] px-2 py-0.5 text-[10px] uppercase tracking-[.1em] text-[var(--kanso-muted)]"
            >
              {t(`profile.formats.${format}`)}
            </span>
          ))}

          {album.spotifyUrl && (
            <button
              type="button"
              onClick={() => openSpotify(album.spotifyUrl)}
              className="ml-auto rounded-lg border border-[var(--kanso-line)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/60 hover:bg-[var(--kanso-mint)]/10"
            >
              {t("profile.listen")}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
