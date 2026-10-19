/* eslint-disable @next/next/no-img-element */
"use client";

import { Link } from "next-view-transitions";
import { Heart } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import type { ArtistLite } from "@/lib/api/artists";

interface ArtistCardProps {
  artist: ArtistLite;
  isFavorite: boolean;
  onToggleFavorite?: () => void;
}

export default function ArtistCard({
  artist,
  isFavorite,
  onToggleFavorite,
}: ArtistCardProps) {
  const t = useTranslations("artists");

  return (
    <article className="kanso-card group flex h-full w-full flex-col items-center gap-3 p-4 text-center">
      <Link
        href={`/artists/${artist.id}`}
        className="flex w-full flex-col items-center gap-3"
      >
        <span className="relative block h-28 w-28 overflow-hidden rounded-full border border-[var(--kanso-line)]">
          {artist.images?.[0]?.url ? (
            <img
              loading="lazy"
              decoding="async"
              src={artist.images[0].url}
              alt={artist.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[var(--surface-3)] text-2xl font-semibold text-[var(--kanso-mint)]">
              {artist.name.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <span className="block w-full truncate text-sm font-semibold text-[var(--foreground)]">
          {artist.name}
        </span>
      </Link>

      <span className="min-h-[1rem] w-full truncate text-xs text-[var(--kanso-muted)]">
        {artist.genres && artist.genres.length > 0
          ? artist.genres.slice(0, 2).join(" · ")
          : "\u00A0"}
      </span>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")}
          className={`mt-auto flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
            isFavorite
              ? "border-[var(--kanso-mint)]/60 bg-[var(--kanso-mint)]/15 text-[var(--kanso-mint)]"
              : "border-[var(--kanso-line)] text-[var(--kanso-mint)] hover:border-[var(--kanso-mint)]/60 hover:bg-[var(--kanso-mint)]/10"
          }`}
        >
          <Heart
            className="h-3.5 w-3.5"
            strokeWidth={2.25}
            fill={isFavorite ? "currentColor" : "none"}
          />
          {isFavorite ? t("removeFavorite") : t("addFavorite")}
        </button>
      )}
    </article>
  );
}
