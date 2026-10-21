/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useMemo, useState } from "react";
import { BiSortAlt2 } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import { useTransitionRouter } from "next-view-transitions";
import AlbumCard from "@/components/AlbumCard";
import { Stagger, StaggerItem } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import SortModal from "@/components/SortModal";
import FilterModal from "@/components/FilterModal";
import { useFavoritesFilter } from "@/hooks/useFavoritesFilter";
import { FilterOptions, SortMethod, type FavoriteTag } from "@/types/favorites";
import { normalizeTagCategory, tagKey } from "@/lib/tags";
import { Skeleton } from "@/components/Skeleton";
import { authFetch } from "@/lib/api/authFetch";
import { getMood } from "@/constants/moods";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";

export default function UserFavorites() {
  const t = useTranslations("favorites");
  const tModal = useTranslations("modal");
  const tMoods = useTranslations("moods");
  const tTags = useTranslations("tags");
  const { user, loading: authLoading } = useAuth();
  const router = useTransitionRouter();
  const [favorites, setFavorites] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortMethod>("");
  const [filters, setFilters] = useState<FilterOptions>({
    moods: [],
    genres: [],
    formats: [],
    tags: [],
  });

  const fetchFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/userFavorites");
      if (!res.ok) throw new Error(`Carga fallida (${res.status})`);
      const data = await res.json();
      setFavorites(data.favorites ?? []);
    } catch (err) {
      console.error("Error cargando la colección:", err);
      setError("No pudimos cargar tu colección. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const { groupedFavorites } = useFavoritesFilter(favorites, sortBy, filters);

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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.uid) {
      fetchFavorites();
    } else {
      // Sin sesión no hay nada que cargar: no dejar el esqueleto indefinidamente.
      setLoading(false);
    }
  }, [user?.uid, authLoading]);

  if (!mounted || loading) {
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

  if (error) {
    return (
      <main className="kanso-main min-h-screen">
        <ErrorState
          variant="page"
          className="mt-20"
          title={t("error")}
          description={t("errorDescription")}
          onRetry={() => user?.uid && fetchFavorites()}
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
      </div>

      {(sortBy ||
        filters.moods.length > 0 ||
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
          {filters.moods.map((mood) => (
            <span
              key={mood}
              className="px-3 py-1 bg-green-900/30 text-green-400 text-sm rounded-full border border-green-400/30 flex items-center gap-2"
            >
              <InlineEmoji emoji={getMood(mood)?.emoji} />
              {tMoods(mood)}
              <button
                onClick={() => {
                  const newMoods = filters.moods.filter((m) => m !== mood);
                  setFilters({ ...filters, moods: newMoods });
                }}
                className="hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </span>
          ))}
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
                    formats: filters.formats.filter((item) => item !== format),
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

      {groupedFavorites.length === 0 ? (
        <section className="mt-10 max-w-xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-7 text-center">
          <span className="text-3xl text-[var(--kanso-mint)]">◇</span>
          <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
            {filters.moods.length ||
            filters.genres.length ||
            filters.formats.length ||
            filters.tags.length
              ? "No hay discos con estos filtros"
              : t("noFavorites")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
            Ajusta los filtros o explora la búsqueda para empezar a construir tu
            colección.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="mt-5 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)]"
          >
            Explorar discos
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
                    onClick={() => router.push(`/albums/${favorite.album.id}`)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ))
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
