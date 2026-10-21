"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import { useDebounce } from "@/hooks/useDebounce";
import ArtistCard from "@/components/ArtistCard";
import { ArtistGridSkeleton } from "@/components/ContentSkeletons";
import ErrorState from "@/components/ErrorState";
import { Stagger, StaggerItem } from "@/components/motion";
import {
  getUserArtists,
  searchArtists,
  toggleArtistFavorite,
  type ArtistLite,
} from "@/lib/api/artists";

export default function ArtistsPage() {
  const t = useTranslations("artists");
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<ArtistLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [favorites, setFavorites] = useState<ArtistLite[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setFavoritesLoaded(true);
      return;
    }

    setFavoritesLoaded(false);
    getUserArtists()
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setFavoritesLoaded(true));
  }, [user?.uid]);

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (!term) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setSearching(true);
    setError(null);

    searchArtists(term)
      .then((items) => {
        if (!cancelled) setResults(items);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, reloadToken]);

  const handleToggle = async (artist: ArtistLite) => {
    if (!user) return;
    try {
      const nowFavorite = await toggleArtistFavorite(artist);
      setFavorites((current) =>
        nowFavorite
          ? [artist, ...current.filter((item) => item.id !== artist.id)]
          : current.filter((item) => item.id !== artist.id),
      );
    } catch {
      // Silencioso: no bloquea la exploración si falla el guardado.
    }
  };

  return (
    <main className="kanso-main min-h-screen">
      <section className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
          {t("eyebrow")}
        </p>
        <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
          {t("subtitle")}
        </p>
      </section>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("placeholder")}
        className="kanso-input mt-8 mb-10 w-full max-w-2xl px-5 py-4 text-sm placeholder:text-[var(--kanso-muted)]"
      />

      {hasQuery ? (
        <section className="w-full max-w-6xl pb-16">
          {searching && (
            <div role="status" aria-busy="true">
              <span className="sr-only">{t("loading")}</span>
              <ArtistGridSkeleton />
            </div>
          )}
          {error && (
            <ErrorState
              variant="inline"
              className="mb-5"
              title={t("error")}
              description={t("errorDescription")}
              onRetry={() => setReloadToken((value) => value + 1)}
            />
          )}
          {!searching && !error && results.length === 0 && (
            <p className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 text-sm text-[var(--kanso-muted)]">
              {t("noResults")}
            </p>
          )}
          {!searching && results.length > 0 && (
            <Stagger
              className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
              stagger={0.04}
              onMount
            >
              {results.map((artist) => (
                <StaggerItem key={artist.id} className="h-full">
                  <ArtistCard
                    artist={artist}
                    isFavorite={favorites.some((item) => item.id === artist.id)}
                    onToggleFavorite={() => handleToggle(artist)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>
      ) : (
        <section className="w-full max-w-6xl pb-16">
          <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {t("yourArtists")}
          </h2>
          {!favoritesLoaded && (
            <div role="status" aria-busy="true">
              <span className="sr-only">{t("loading")}</span>
              <ArtistGridSkeleton />
            </div>
          )}
          {favoritesLoaded && favorites.length === 0 && (
            <p className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 text-sm text-[var(--kanso-muted)]">
              {t("empty")}
            </p>
          )}
          {favorites.length > 0 && (
            <Stagger
              className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
              stagger={0.04}
              onMount
            >
              {favorites.map((artist) => (
                <StaggerItem key={artist.id} className="h-full">
                  <ArtistCard
                    artist={artist}
                    isFavorite
                    onToggleFavorite={() => handleToggle(artist)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </section>
      )}
    </main>
  );
}
