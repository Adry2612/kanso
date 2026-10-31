/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import AlbumCard from "@/components/AlbumCard";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import { Stagger, StaggerItem } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import { useArtistDetail } from "@/hooks/client/useArtistDetail";
import { formatFollowers, getArtistGenres } from "@/utils/artists";

export default function ArtistPage() {
  const params = useParams();
  const artistId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const t = useTranslations("artists");
  const { artist, albums, error, reload } = useArtistDetail(artistId);
  const genres = getArtistGenres(artist);

  return (
    <main className="kanso-main min-h-screen">
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex items-center gap-2 text-xs text-[var(--kanso-mint)] transition hover:text-[var(--foreground)]"
      >
        ← {t("back")}
      </button>

      {artist && (
        <header className="flex flex-col items-start gap-6 border-b border-[var(--kanso-line)] pb-8 sm:flex-row sm:items-end">
          <span className="relative block h-32 w-32 shrink-0 overflow-hidden rounded-full border border-[var(--kanso-line)]">
            {artist.images?.[0]?.url ? (
              <img
                loading="lazy"
                decoding="async"
                src={artist.images[0].url}
                alt={artist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[var(--surface-3)] text-3xl font-semibold text-[var(--kanso-mint)]">
                {artist.name.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              {t("eyebrow")}
            </p>
            <h1 className="mt-2 truncate text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
              {artist.name}
            </h1>
            {genres.length > 0 && (
              <p className="mt-2 text-sm text-[var(--kanso-muted)]">
                {genres.join(" · ")}
              </p>
            )}
            {typeof artist.followers?.total === "number" && (
              <p className="mt-1 text-xs text-[var(--kanso-muted)]">
                {formatFollowers(artist.followers.total)} {t("followers")}
              </p>
            )}
          </div>
        </header>
      )}

      <section className="mt-10">
        <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {t("discography")}
        </h2>

        {error && (
          <ErrorState
            title={t("error")}
            description={t("errorDescription")}
            onRetry={reload}
          />
        )}

        {!albums && !error && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
            {[...Array(8)].map((_, index) => (
              <Skeleton
                key={index}
                className="aspect-square w-full rounded-2xl"
              />
            ))}
          </div>
        )}

        {albums && albums.length === 0 && (
          <p className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 text-sm text-[var(--kanso-muted)]">
            {t("noAlbums")}
          </p>
        )}

        {albums && albums.length > 0 && (
          <Stagger
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
            stagger={0.04}
            onMount
          >
            {albums.map((album) => (
              <StaggerItem key={album.id}>
                <AlbumCard album={album} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </main>
  );
}
