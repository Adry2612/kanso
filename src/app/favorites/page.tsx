"use client";

import { useTransitionRouter } from "next-view-transitions";
import { useTranslations } from "@/context/I18nContext";
import { useFavoritesPage } from "@/hooks/client/useFavoritesPage";
import { getMood } from "@/constants/moods";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import SortModal from "@/components/SortModal";
import FilterModal from "@/components/FilterModal";
import FavoritesHeader from "./components/FavoritesHeader";
import FavoritesSearch from "./components/FavoritesSearch";
import FavoritesTabs from "./components/FavoritesTabs";
import FavoritesMoodChips, {
  type MoodChip,
} from "./components/FavoritesMoodChips";
import FavoritesActiveFilters from "./components/FavoritesActiveFilters";
import FavoritesEmptyState from "./components/FavoritesEmptyState";
import FavoritesCollectionGrid from "./components/FavoritesCollectionGrid";
import ListenLaterGrid from "./components/ListenLaterGrid";
import type {
  FavoriteFormat,
  FavoriteTag,
  SortMethod,
} from "@/types/favorites";

export default function UserFavorites() {
  const t = useTranslations("favorites");
  const tModal = useTranslations("modal");
  const tMoods = useTranslations("moods");
  const tTags = useTranslations("tags");
  const router = useTransitionRouter();
  const {
    activeTab,
    setActiveTab,
    mounted,
    loading,
    pendingLoading,
    error,
    pendingError,
    showSortModal,
    setShowSortModal,
    showFilterModal,
    setShowFilterModal,
    query,
    setQuery,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    fetchLibrary,
    groupedFavorites,
    availableMoods,
    orderedPending,
    filteredPending,
    hasFilters,
    activeFilterCount,
    sortLabelKey,
    availableTags,
    clearFilters,
    clearMoods,
    toggleMood,
    removeGenre,
    removeFormat,
    removeTag,
    categoryLabelKey,
  } = useFavoritesPage(tMoods);

  const formatLabel = (format: FavoriteFormat) => {
    if (format === "vinyl") return "Vinilo";
    if (format === "cassette") return "Cassette";
    if (format === "cd") return "CD";
    return "Digital";
  };

  const genreLabel = (genre: string) =>
    tModal(`filter.genres.${genre === "hip-hop" ? "hiphop" : genre}`);

  const tagCategoryLabel = (category: string) =>
    tTags(categoryLabelKey(category));

  const tagRemoveLabel = (tag: FavoriteTag) =>
    tTags("remove").replace(
      "{tag}",
      `${tagCategoryLabel(tag.category)}: ${tag.value}`,
    );

  const moodChips: MoodChip[] = availableMoods.map((mood) => ({
    key: mood,
    label: tMoods(mood),
    emoji: getMood(mood)?.emoji,
  }));

  const sortLabel = sortBy
    ? `${t("sort")}: ${tModal(`sort.${sortLabelKey}`)}`
    : null;

  if (!mounted || loading || pendingLoading) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="flex flex-row items-center justify-between text-[var(--foreground)]">
          <Skeleton className="mb-8 h-8 w-56" />
          <div className="flex gap-4">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={`favorite-skeleton-${index}`} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
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
          onRetry={() => fetchLibrary()}
        />
      </main>
    );
  }

  return (
    <main className="kanso-main min-h-screen">
      <FavoritesHeader
        activeTab={activeTab}
        sortBy={sortBy}
        activeFilterCount={activeFilterCount}
        labels={{
          eyebrow: "Tu archivo personal",
          title: t("title"),
          sort: t("sort"),
          filter: t("filter"),
        }}
        onOpenSort={() => setShowSortModal(true)}
        onOpenFilter={() => setShowFilterModal(true)}
      />

      <FavoritesSearch
        query={query}
        placeholder={t("searchPlaceholder")}
        clearLabel={t("clearSearch")}
        onChange={setQuery}
        onClear={() => setQuery("")}
      />

      <FavoritesTabs
        activeTab={activeTab}
        labels={{
          collection: t("collectionTab"),
          listenLater: t("listenLaterTab"),
          ariaLabel: t("title"),
        }}
        onChange={setActiveTab}
      />

      {activeTab === "collection" && (
        <FavoritesMoodChips
          moods={moodChips}
          selected={filters.moods}
          allLabel={t("allMoods")}
          onClear={clearMoods}
          onToggle={toggleMood}
        />
      )}

      {activeTab === "collection" && (
        <FavoritesActiveFilters
          sortLabel={sortLabel}
          genres={filters.genres}
          formats={filters.formats}
          tags={filters.tags}
          genreLabel={genreLabel}
          formatLabel={formatLabel}
          tagCategoryLabel={tagCategoryLabel}
          tagRemoveLabel={tagRemoveLabel}
          onClearSort={() => setSortBy("")}
          onRemoveGenre={removeGenre}
          onRemoveFormat={removeFormat}
          onRemoveTag={removeTag}
        />
      )}

      {activeTab === "collection" ? (
        groupedFavorites.length === 0 ? (
          <FavoritesEmptyState
            variant={hasFilters ? "collection-filtered" : "collection"}
            title={hasFilters ? t("noMatches") : t("noFavorites")}
            description={
              hasFilters
                ? t("noMatchesDescription")
                : "Ajusta los filtros o explora la búsqueda para empezar a construir tu colección."
            }
            actionLabel={hasFilters ? t("clearFilters") : "Explorar discos"}
            onAction={() =>
              hasFilters ? clearFilters() : router.push("/search")
            }
          />
        ) : (
          <FavoritesCollectionGrid
            groups={groupedFavorites}
            onOpenAlbum={(albumId) => router.push(`/albums/${albumId}`)}
          />
        )
      ) : pendingError ? (
        <ErrorState
          variant="inline"
          className="mt-10 max-w-xl"
          title={t("listenLaterError")}
          onRetry={() => fetchLibrary()}
        />
      ) : orderedPending.length === 0 ? (
        <FavoritesEmptyState
          variant="listen-later"
          title={t("noListenLater")}
          description={t("listenLaterEmptyDescription")}
          actionLabel={t("listenLaterAddFirst")}
          onAction={() => router.push("/search")}
        />
      ) : filteredPending.length === 0 ? (
        <FavoritesEmptyState
          variant="listen-later-filtered"
          title={t("noMatches")}
          description={t("noMatchesDescription")}
          actionLabel={t("clearSearch")}
          onAction={() => setQuery("")}
        />
      ) : (
        <ListenLaterGrid
          items={filteredPending}
          title={t("listenLaterTitle")}
          onOpenAlbum={(albumId) => router.push(`/albums/${albumId}`)}
        />
      )}

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
