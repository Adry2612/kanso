/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import { Search } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import AlbumCard from "@/components/AlbumCard";
import { Stagger, StaggerItem } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import SortModal from "@/components/SortModal";
import FilterModal from "@/components/FilterModal";
import { useFavoritesFilter } from "@/hooks/useFavoritesFilter";
import {
  FilterOptions,
  ListenLaterAlbum,
  SortMethod,
  type FavoriteTag,
} from "@/types/favorites";
import { normalizeTagCategory, tagKey } from "@/lib/tags";
import { Skeleton } from "@/components/Skeleton";
import { authFetch } from "@/lib/api/authFetch";
import { getListenLater } from "@/lib/api/listenLater";
import { getMood, normalizeMoods } from "@/constants/moods";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";

type FavoritesTab = "collection" | "listenLater";

export default function UserFavorites() {
  const t = useTranslations("favorites");
  const tModal = useTranslations("modal");
  const tMoods = useTranslations("moods");
  const tTags = useTranslations("tags");
  const { user, loading: authLoading } = useAuth();
  const router = useTransitionRouter();
  const [favorites, setFavorites] = useState([]);
  const [pending, setPending] = useState<ListenLaterAlbum[]>([]);
  const [activeTab, setActiveTab] = useState<FavoritesTab>("collection");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMethod>("");
  const [filters, setFilters] = useState<FilterOptions>({
    moods: [],
    genres: [],
    formats: [],
    tags: [],
  });

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setPendingLoading(true);
    setError(null);
    setPendingError(null);

    const [favoritesResult, pendingResult] = await Promise.allSettled([
      authFetch("/api/userFavorites").then(async (res) => {
        if (!res.ok) throw new Error(`Carga fallida (${res.status})`);
        const data = await res.json();
        return data.favorites ?? [];
      }),
      getListenLater(),
    ]);

    if (favoritesResult.status === "fulfilled") {
      setFavorites(favoritesResult.value);
    } else {
      console.error("Error cargando la colección:", favoritesResult.reason);
      setError("No pudimos cargar tu colección. Inténtalo de nuevo.");
    }

    if (pendingResult.status === "fulfilled") {
      setPending(pendingResult.value);
    } else {
      console.error("Error cargando pendientes:", pendingResult.reason);
      setPendingError("No pudimos cargar tus pendientes. Inténtalo de nuevo.");
    }

    setLoading(false);
    setPendingLoading(false);
  }, []);

  const searchedFavorites = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return favorites;

    return (favorites as any[]).filter((favorite) => {
      const album = favorite.album ?? {};
      const artists = (album.artists ?? [])
        .map((artist: { name?: string }) => artist?.name ?? "")
        .join(" ");
      return `${album.name ?? ""} ${artists}`.toLowerCase().includes(term);
    });
  }, [favorites, query]);

  const { groupedFavorites } = useFavoritesFilter(
    searchedFavorites,
    sortBy,
    filters,
  );

  const availableMoods = useMemo(() => {
    const moods = (favorites as any[]).flatMap(
      (favorite) => favorite.labeledFeelings ?? favorite.moods ?? [],
    );
    return normalizeMoods(moods).sort((a, b) =>
      tMoods(a).localeCompare(tMoods(b)),
    );
  }, [favorites, tMoods]);

  const orderedPending = useMemo(
    () =>
      [...pending].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      ),
    [pending],
  );

  const filteredPending = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return orderedPending;

    return orderedPending.filter((pendingAlbum) => {
      const artists = (pendingAlbum.album.artists ?? [])
        .map((artist) => artist?.name ?? "")
        .join(" ");
      return `${pendingAlbum.album.name ?? ""} ${artists}`
        .toLowerCase()
        .includes(term);
    });
  }, [orderedPending, query]);

  const hasCollectionFilters = Boolean(
    query.trim() ||
    filters.moods.length > 0 ||
    filters.genres.length > 0 ||
    filters.formats.length > 0 ||
    filters.tags.length > 0,
  );

  const clearFilters = () => {
    setQuery("");
    setFilters({ moods: [], genres: [], formats: [], tags: [] });
  };

  const availableTags = useMemo(() => {
    const unique = new Map<string, FavoriteTag>();

    (favorites as any[]).forEach((favorite) => {
      (favorite.tags ?? []).forEach((tag: FavoriteTag) => {
        const value = tag?.value?.trim();
        if (!tag?.category || !value) return;
        const normalized: FavoriteTag = {
          category: normalizeTagCategory(tag.category),
          value,
        };
        const key = tagKey(normalized);
        if (!unique.has(key)) unique.set(key, normalized);
      });
    });

    return Array.from(unique.values());
  }, [favorites]);

  const tagCategoryLabel = (category: string) => {
    const normalized = normalizeTagCategory(category);
    if (normalized === "idioma") return tTags("categories.language");
    if (normalized === "género") return tTags("categories.genre");
    return tTags("categories.other");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "listen-later") {
      setActiveTab("listenLater");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.uid) {
      fetchLibrary();
    } else {
      // Sin sesión no hay nada que cargar: no dejar el esqueleto indefinidamente.
      setLoading(false);
      setPendingLoading(false);
    }
  }, [user?.uid, authLoading, fetchLibrary]);

  if (!mounted || loading || pendingLoading) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="flex flex-row items-center justify-between text-[var(--foreground)]">
          <Skeleton className="w-56 h-8 mb-8" />
          <div className="flex gap-4">
            <Skeleton className="w-28 h-9 rounded-full" />
            <Skeleton className="w-28 h-9 rounded-full" />
          </div>
        </div>
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
          {[...Array(8)].map((_, idx) => (
            <div key={`favorite-skeleton-${idx}`} className="space-y-3">
              <Skeleton className="w-full h-48 rounded-lg" />
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error && activeTab === "collection") {
    return (
      <main className="kanso-main min-h-screen">
        <ErrorState
          variant="page"
          className="mt-20"
          title={t("error")}
          description={t("errorDescription")}
          onRetry={() => user?.uid && fetchLibrary()}
        />
      </main>
    );
  }

  return (
    <main className="kanso-main min-h-screen">
      <div className="mb-10 flex flex-col items-start justify-between gap-5 text-[var(--foreground)] md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
            Tu archivo personal
          </p>
          <span className="mt-3 block text-5xl font-semibold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </span>
        </div>

        {activeTab === "collection" && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowSortModal(true)}
              className="relative flex flex-row items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)] px-4 py-2 text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
            >
              <BiSortAlt2 size={20} />
              {t("sort")}
              {sortBy && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="relative flex flex-row items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)] px-4 py-2 text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
            >
              <MdFilterList size={20} />
              {t("filter")}
              {(filters.moods.length > 0 ||
                filters.genres.length > 0 ||
                filters.formats.length > 0 ||
                filters.tags.length > 0) && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-[var(--background)] text-xs font-bold">
                  {filters.moods.length +
                    filters.genres.length +
                    filters.formats.length +
                    filters.tags.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <section className="mb-6" aria-label={t("searchPlaceholder")}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kanso-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="kanso-input w-full py-2.5 pl-10 pr-10 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("clearSearch")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--kanso-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      <div
        role="tablist"
        aria-label={t("title")}
        className="mb-8 flex gap-6 border-b border-[var(--kanso-line)]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "collection"}
          onClick={() => setActiveTab("collection")}
          className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
            activeTab === "collection"
              ? "border-[var(--kanso-mint)] text-[var(--kanso-mint)]"
              : "border-transparent text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("collectionTab")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "listenLater"}
          onClick={() => setActiveTab("listenLater")}
          className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
            activeTab === "listenLater"
              ? "border-[var(--kanso-mint)] text-[var(--kanso-mint)]"
              : "border-transparent text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("listenLaterTab")}
        </button>
      </div>

      {activeTab === "collection" && availableMoods.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filters.moods.length === 0}
            onClick={() => setFilters((current) => ({ ...current, moods: [] }))}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              filters.moods.length === 0
                ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
            }`}
          >
            {t("allMoods")}
          </button>
          {availableMoods.map((mood) => {
            const active = filters.moods.includes(mood);
            return (
              <button
                key={mood}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    moods: active
                      ? current.moods.filter((item) => item !== mood)
                      : [...current.moods, mood],
                  }))
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                    : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                }`}
              >
                <InlineEmoji emoji={getMood(mood)?.emoji} />
                {tMoods(mood)}
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "collection" &&
        (sortBy ||
          filters.genres.length > 0 ||
          filters.formats.length > 0 ||
          filters.tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {sortBy && (
              <span className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full border border-green-400/30 flex items-center gap-2">
                <BiSortAlt2 size={16} />
                {t("sort")}:{" "}
                {tModal(
                  `sort.${sortBy.replace(/-./g, (match) => match[1].toUpperCase()).replace(/^./, (match) => match.toLowerCase())}`,
                )}
                <button
                  onClick={() => setSortBy("")}
                  className="hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            )}
            {filters.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full border border-green-400/30 flex items-center gap-2"
              >
                {tModal(
                  `filter.genres.${genre === "hip-hop" ? "hiphop" : genre}`,
                )}
                <button
                  onClick={() => {
                    const newGenres = filters.genres.filter((g) => g !== genre);
                    setFilters({ ...filters, genres: newGenres });
                  }}
                  className="hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
            {filters.formats.map((format) => (
              <span
                key={format}
                className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--kanso-mint)]"
              >
                {format === "vinyl"
                  ? "Vinilo"
                  : format === "cassette"
                    ? "Cassette"
                    : format === "cd"
                      ? "CD"
                      : "Digital"}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      formats: filters.formats.filter(
                        (item) => item !== format,
                      ),
                    })
                  }
                  className="hover:text-[var(--kanso-danger)]"
                >
                  ✕
                </button>
              </span>
            ))}
            {filters.tags.map((tag) => (
              <span
                key={tagKey(tag)}
                className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[var(--kanso-mint)]"
              >
                <span className="text-xs uppercase tracking-[.1em] text-[var(--kanso-muted)]">
                  {tagCategoryLabel(tag.category)}
                </span>
                {tag.value}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      tags: filters.tags.filter(
                        (item) => tagKey(item) !== tagKey(tag),
                      ),
                    })
                  }
                  className="hover:text-[var(--kanso-danger)]"
                  aria-label={tTags("remove").replace(
                    "{tag}",
                    `${tagCategoryLabel(tag.category)}: ${tag.value}`,
                  )}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

      {activeTab === "collection" ? (
        groupedFavorites.length === 0 ? (
          <section className="mt-10 max-w-xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-7 text-center">
            <span className="text-3xl text-[var(--kanso-mint)]">◇</span>
            <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
              {hasCollectionFilters ? t("noMatches") : t("noFavorites")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
              {hasCollectionFilters
                ? t("noMatchesDescription")
                : "Ajusta los filtros o explora la búsqueda para empezar a construir tu colección."}
            </p>
            <button
              onClick={() =>
                hasCollectionFilters ? clearFilters() : router.push("/search")
              }
              className="mt-5 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)]"
            >
              {hasCollectionFilters ? t("clearFilters") : "Explorar discos"}
            </button>
          </section>
        ) : (
          groupedFavorites.map((group, idx) => (
            <div key={idx} className="mb-12">
              <h2 className="text-4xl font-bold text-[var(--foreground)] mb-6 border-b border-green-900/30 pb-2">
                {group.groupName}
              </h2>
              <Stagger
                className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
                stagger={0.04}
                onMount
              >
                {group.items.map((favorite: any) => (
                  <StaggerItem key={favorite.album.id}>
                    <AlbumCard
                      album={favorite.album}
                      onClick={() =>
                        router.push(`/albums/${favorite.album.id}`)
                      }
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          ))
        )
      ) : pendingError ? (
        <ErrorState
          variant="inline"
          className="mt-10 max-w-xl"
          title={t("listenLaterError")}
          onRetry={() => user?.uid && fetchLibrary()}
        />
      ) : orderedPending.length === 0 ? (
        <section className="mt-10 max-w-xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-7 text-center">
          <span className="text-3xl text-[var(--kanso-mint)]">◷</span>
          <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
            {t("noListenLater")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("listenLaterEmptyDescription")}
          </p>
          <button
            onClick={() => router.push("/search")}
            className="mt-5 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)]"
          >
            {t("listenLaterAddFirst")}
          </button>
        </section>
      ) : filteredPending.length === 0 ? (
        <section className="mt-10 max-w-xl rounded-2xl border border-dashed border-[var(--kanso-line)] p-7 text-center">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {t("noMatches")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("noMatchesDescription")}
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-5 rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-sm font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
          >
            {t("clearSearch")}
          </button>
        </section>
      ) : (
        <>
          <h2 className="mb-6 border-b border-green-900/30 pb-2 text-4xl font-bold text-[var(--foreground)]">
            {t("listenLaterTitle")}
          </h2>
          <Stagger
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
            stagger={0.04}
            onMount
          >
            {filteredPending.map((pendingAlbum) => (
              <StaggerItem key={pendingAlbum.id}>
                <AlbumCard
                  album={pendingAlbum.album}
                  onClick={() =>
                    router.push(`/albums/${pendingAlbum.album.id}`)
                  }
                />
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}

      {/* Modales */}
      <SortModal
        isOpen={showSortModal}
        onClose={() => setShowSortModal(false)}
        currentSort={sortBy}
        onSortChange={(value) => setSortBy(value as SortMethod)}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />
    </main>
  );
}
