"use client";

import { useTransitionRouter } from "next-view-transitions";
import { useTranslations } from "@/context/I18nContext";
import { useCollectionPage } from "@/hooks/client/useCollectionPage";
import { openSpotify } from "@/lib/spotifyUtils";
import { getMood, normalizeMood } from "@/constants/moods";
import { tagDisplayLabel } from "@/constants/taxonomy";
import { UNKNOWN_GROUP, prioritizeMoods } from "@/utils/collection";
import { genreBranchLabelKey } from "@/utils/genres";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import SortModal from "@/components/SortModal";
import FilterModal from "@/components/FilterModal";
import InlineEmoji from "@/components/InlineEmoji";
import { Stagger, StaggerItem } from "@/components/motion";
import GalleryCard from "@/components/gallery/GalleryCard";
import GalleryGroupHeader from "@/components/gallery/GalleryGroupHeader";
import GalleryRow from "@/components/gallery/GalleryRow";
import GallerySkeleton from "@/components/gallery/GallerySkeleton";
import GalleryStats from "@/components/gallery/GalleryStats";
import GalleryViewToggle from "@/components/gallery/GalleryViewToggle";
import { BiSortAlt2 } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import { Music2, Shuffle, Sparkles, Users } from "lucide-react";
import CollectionHeader from "./components/CollectionHeader";
import CollectionSearch from "./components/CollectionSearch";
import CollectionTabs from "./components/CollectionTabs";
import CollectionMoodChips, {
  type MoodChip,
} from "./components/CollectionMoodChips";
import CollectionActiveFilters from "./components/CollectionActiveFilters";
import CollectionEmptyState from "./components/CollectionEmptyState";
import CollectionIncompleteNotice from "./components/CollectionIncompleteNotice";
import type {
  CollectionAlbum,
  CollectionFormat,
  CollectionTag,
  ListenLaterItem,
  SortMethod,
} from "@/types/collection";

export default function CollectionPage() {
  const t = useTranslations("collection");
  const tModal = useTranslations("modal");
  const tMoods = useTranslations("moods");
  const tTags = useTranslations("tags");
  const tTaxonomy = useTranslations("taxonomy");
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
    view,
    setView,
    groupBy,
    sortedCollection,
    collectionGroups,
    filteredPending,
    stats,
    insights,
    noticeDismissed,
    dismissIncompleteNotice,
    reviewIncomplete,
    removeGroupBy,
    clearIncomplete,
    pendingStats,
    availableMoods,
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
  } = useCollectionPage(tMoods);

  const formatLabel = (format: CollectionFormat) => t(`formats.${format}`);

  const discoverPending = () => {
    if (filteredPending.length === 0) return;
    const item =
      filteredPending[Math.floor(Math.random() * filteredPending.length)];
    const albumId = item.album?.id ?? item.albumId;
    if (albumId) router.push(`/albums/${albumId}`);
  };

  const genreLabel = (genre: string) =>
    tModal(`filter.genres.${genreBranchLabelKey(genre)}`);

  const tagCategoryLabel = (category: string) =>
    tTags(categoryLabelKey(category));

  const tagLabel = (tag: CollectionTag) => tagDisplayLabel(tag, tTaxonomy);

  const tagRemoveLabel = (tag: CollectionTag) =>
    tTags("remove").replace(
      "{tag}",
      `${tagCategoryLabel(tag.category)}: ${tagLabel(tag)}`,
    );

  const moodChips: MoodChip[] = availableMoods.map((mood) => ({
    key: mood,
    label: tMoods(mood),
    emoji: getMood(mood)?.emoji,
  }));

  const sortLabel = sortBy
    ? `${t("sort")}: ${tModal(`sort.${sortLabelKey}`)}`
    : null;

  const totalLabel = (count: number) =>
    t(count === 1 ? "stats.totalOne" : "stats.total").toLowerCase();
  const artistsLabel = (count: number) =>
    t(count === 1 ? "stats.artistsOne" : "stats.artists").toLowerCase();
  const moodsLabel = (count: number) =>
    t(count === 1 ? "stats.moodsOne" : "stats.moods").toLowerCase();

  const moodBadges = (
    entry: CollectionAlbum,
    max: number,
    highlightedMoods: string[],
  ) => {
    const itemMoods = entry.labeledFeelings ?? entry.moods ?? [];
    const orderedMoods = prioritizeMoods(itemMoods, highlightedMoods);
    return (
      <>
        {orderedMoods.slice(0, max).map((mood) => {
          const isFiltered = highlightedMoods
            .map(normalizeMood)
            .includes(normalizeMood(mood));
          return (
            <span
              key={mood}
              data-filtered={isFiltered || undefined}
              className={
                isFiltered
                  ? "rounded-full border-2 border-white bg-[var(--kanso-mint)] px-2 py-0.5 text-[10px] font-bold text-[var(--background)] shadow-[0_0_0_2px_var(--kanso-mint)] backdrop-blur"
                  : "rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur"
              }
            >
              <InlineEmoji emoji={getMood(mood)?.emoji} />
              {tMoods(mood)}
              {isFiltered && (
                <span className="sr-only"> · {t("activeMoodFilter")}</span>
              )}
            </span>
          );
        })}
        {orderedMoods.length > max && (
          <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur">
            +{orderedMoods.length - max}
          </span>
        )}
      </>
    );
  };

  const moodBadgesInline = (
    entry: CollectionAlbum,
    max: number,
    highlightedMoods: string[],
  ) => {
    const itemMoods = entry.labeledFeelings ?? entry.moods ?? [];
    const orderedMoods = prioritizeMoods(itemMoods, highlightedMoods);
    return (
      <>
        {orderedMoods.slice(0, max).map((mood) => {
          const isFiltered = highlightedMoods
            .map(normalizeMood)
            .includes(normalizeMood(mood));
          return (
            <span
              key={mood}
              data-filtered={isFiltered || undefined}
              className={
                isFiltered
                  ? "rounded-full bg-[var(--kanso-mint)] px-2 py-0.5 text-[10px] font-bold text-[var(--background)] ring-2 ring-[var(--kanso-mint)]/45"
                  : "rounded-full bg-[var(--kanso-mint)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-mint)]"
              }
            >
              <InlineEmoji emoji={getMood(mood)?.emoji} />
              {tMoods(mood)}
              {isFiltered && (
                <span className="sr-only"> · {t("activeMoodFilter")}</span>
              )}
            </span>
          );
        })}
        {orderedMoods.length > max && (
          <span className="rounded-full border border-[var(--kanso-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-muted)]">
            +{orderedMoods.length - max}
          </span>
        )}
      </>
    );
  };

  const formatBadges = (entry: CollectionAlbum) => {
    if (!entry.format || entry.format.length === 0) return null;
    return (
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {entry.format.map((format) => (
          <span
            key={format}
            className="rounded-full border border-[var(--kanso-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-muted)]"
          >
            {formatLabel(format)}
          </span>
        ))}
      </div>
    );
  };

  const artistName = (album: CollectionAlbum["album"]) =>
    album.artists[0]?.name || t("unknownArtist");

  const groupLabel = (name: string) => {
    if (name !== UNKNOWN_GROUP) return name;
    return groupBy === "year" ? t("unknownYear") : t("unknownArtist");
  };

  const countLabel = (key: string, keyOne: string, count: number) =>
    t(count === 1 ? keyOne : key).replace("{count}", String(count));

  const incompleteMessage = (() => {
    const { incomplete, missingMoods, missingActivities } = insights;

    if (missingMoods > 0 && missingActivities > 0) {
      return {
        message: countLabel(
          "incomplete.both",
          "incomplete.bothOne",
          incomplete,
        ),
        detail: t("incomplete.detailBoth")
          .replace("{moods}", String(missingMoods))
          .replace("{activities}", String(missingActivities)),
      };
    }

    if (missingMoods > 0) {
      return {
        message: countLabel(
          "incomplete.moods",
          "incomplete.moodsOne",
          missingMoods,
        ),
      };
    }

    if (missingActivities > 0) {
      return {
        message: countLabel(
          "incomplete.activities",
          "incomplete.activitiesOne",
          missingActivities,
        ),
      };
    }

    return null;
  })();

  const groupByLabel =
    filters.groupBy === "none"
      ? null
      : `${t("groupBy.label")}: ${t(`groupBy.${filters.groupBy}`)}`;

  const renderCollectionItems = (items: CollectionAlbum[]) =>
    view === "grid" ? (
      <Stagger className="kanso-album-grid mt-5" stagger={0.03} onMount>
        {items.map((entry) => (
          <StaggerItem key={entry.id} y={12}>
            <GalleryCard
              href={`/albums/${entry.album.id}`}
              image={entry.album.images[0]?.url}
              title={entry.album.name}
              artist={artistName(entry.album)}
              badges={moodBadges(entry, 2, filters.moods)}
              footer={formatBadges(entry)}
              listenLabel={t("listen")}
              onListen={() => openSpotify(entry.album.external_urls?.spotify)}
            />
          </StaggerItem>
        ))}
      </Stagger>
    ) : (
      <div className="mt-2 divide-y divide-[var(--kanso-line)]">
        {items.map((entry) => (
          <GalleryRow
            key={entry.id}
            href={`/albums/${entry.album.id}`}
            image={entry.album.images[0]?.url}
            title={entry.album.name}
            artist={artistName(entry.album)}
            badges={moodBadgesInline(entry, 3, filters.moods)}
            footer={formatBadges(entry)}
            listenLabel={t("listen")}
            onListen={() => openSpotify(entry.album.external_urls?.spotify)}
          />
        ))}
      </div>
    );

  const renderPendingItems = (items: ListenLaterItem[]) =>
    view === "grid" ? (
      <Stagger className="kanso-album-grid mt-5" stagger={0.03} onMount>
        {items.map((entry) => (
          <StaggerItem key={entry.id} y={12}>
            <GalleryCard
              href={`/albums/${entry.album.id}`}
              image={entry.album.images[0]?.url}
              title={entry.album.name}
              artist={artistName(entry.album)}
              listenLabel={t("listen")}
              onListen={() => openSpotify(entry.album.external_urls?.spotify)}
            />
          </StaggerItem>
        ))}
      </Stagger>
    ) : (
      <div className="mt-2 divide-y divide-[var(--kanso-line)]">
        {items.map((entry) => (
          <GalleryRow
            key={entry.id}
            href={`/albums/${entry.album.id}`}
            image={entry.album.images[0]?.url}
            title={entry.album.name}
            artist={artistName(entry.album)}
            listenLabel={t("listen")}
            onListen={() => openSpotify(entry.album.external_urls?.spotify)}
          />
        ))}
      </div>
    );

  if (!mounted || loading || pendingLoading) {
    return (
      <main className="kanso-main min-h-screen">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-12 w-56 max-w-full" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        <div className="mt-6 flex gap-4">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-4 w-24" />
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 md:flex-row">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <div className="mt-10">
          <GallerySkeleton count={8} />
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
      <CollectionHeader
        labels={{
          eyebrow: t("eyebrow"),
          title: t("title"),
          subtitle: t("subtitle"),
        }}
        stats={
          activeTab === "collection"
            ? stats.total > 0 && (
                <GalleryStats
                  stats={[
                    {
                      id: "total",
                      icon: Sparkles,
                      value: stats.total,
                      label: totalLabel(stats.total),
                    },
                    {
                      id: "artists",
                      icon: Users,
                      value: stats.artists,
                      label: artistsLabel(stats.artists),
                    },
                    {
                      id: "moods",
                      icon: Music2,
                      value: stats.moods,
                      label: moodsLabel(stats.moods),
                    },
                  ]}
                />
              )
            : pendingStats.total > 0 && (
                <GalleryStats
                  stats={[
                    {
                      id: "total",
                      icon: Sparkles,
                      value: pendingStats.total,
                      label: totalLabel(pendingStats.total),
                    },
                    {
                      id: "artists",
                      icon: Users,
                      value: pendingStats.artists,
                      label: artistsLabel(pendingStats.artists),
                    },
                  ]}
                />
              )
        }
      />

      <CollectionTabs
        activeTab={activeTab}
        labels={{
          collection: t("collectionTab"),
          listenLater: t("listenLaterTab"),
          ariaLabel: t("title"),
        }}
        onChange={setActiveTab}
      />

      {activeTab === "collection" &&
        incompleteMessage &&
        !filters.incompleteOnly &&
        !noticeDismissed && (
          <CollectionIncompleteNotice
            message={incompleteMessage.message}
            detail={incompleteMessage.detail}
            reviewLabel={t("incomplete.review")}
            dismissLabel={t("incomplete.dismiss")}
            onReview={reviewIncomplete}
            onDismiss={dismissIncompleteNotice}
          />
        )}

      {activeTab === "collection" ? (
        <>
          <section className="mt-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <CollectionSearch
                query={query}
                placeholder={t("searchPlaceholder")}
                clearLabel={t("clearSearch")}
                onChange={setQuery}
                onClear={() => setQuery("")}
                className="flex-1"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSortModal(true)}
                  className="relative inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] px-3 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)]"
                >
                  <BiSortAlt2 size={18} />
                  {t("sort")}
                  {sortBy && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterModal(true)}
                  className="relative inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] px-3 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)]"
                >
                  <MdFilterList size={18} />
                  {t("filter")}
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 text-xs font-bold text-[var(--background)]">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <GalleryViewToggle
                  view={view}
                  onChange={setView}
                  labels={{
                    viewList: t("viewList"),
                    viewGrid: t("viewGrid"),
                  }}
                />
              </div>
            </div>
          </section>

          <CollectionMoodChips
            moods={moodChips}
            selected={filters.moods}
            allLabel={t("allMoods")}
            onClear={clearMoods}
            onToggle={toggleMood}
          />

          <CollectionActiveFilters
            sortLabel={sortLabel}
            groupLabel={groupByLabel}
            incomplete={filters.incompleteOnly}
            incompleteLabel={t("incomplete.filterChip")}
            removeLabel={t("removeFilter")}
            onClearGroup={removeGroupBy}
            onClearIncomplete={clearIncomplete}
            genres={filters.genres}
            formats={filters.formats}
            tags={filters.tags}
            genreLabel={genreLabel}
            formatLabel={formatLabel}
            tagCategoryLabel={tagCategoryLabel}
            tagLabel={tagLabel}
            tagRemoveLabel={tagRemoveLabel}
            onClearSort={() => setSortBy("")}
            onRemoveGenre={removeGenre}
            onRemoveFormat={removeFormat}
            onRemoveTag={removeTag}
          />

          {sortedCollection.length === 0 ? (
            <CollectionEmptyState
              variant={stats.total === 0 ? "collection" : "collection-filtered"}
              title={stats.total === 0 ? t("noCollection") : t("noMatches")}
              description={
                stats.total === 0
                  ? t("noCollectionDescription")
                  : t("noMatchesDescription")
              }
              actionLabel={
                stats.total === 0 ? t("exploreCollection") : t("clearFilters")
              }
              onAction={() =>
                stats.total === 0 ? router.push("/search") : clearFilters()
              }
            />
          ) : filters.groupBy === "none" ? (
            <div className="mt-10">
              {renderCollectionItems(sortedCollection)}
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              {collectionGroups.map((group, index) => (
                <section key={`${group.groupName}-${index}`}>
                  <GalleryGroupHeader
                    label={groupLabel(group.groupName)}
                    count={group.items.length}
                    countLabel={totalLabel(group.items.length)}
                  />
                  {renderCollectionItems(group.items)}
                </section>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <section className="mt-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <CollectionSearch
                query={query}
                placeholder={t("searchPlaceholder")}
                clearLabel={t("clearSearch")}
                onChange={setQuery}
                onClear={() => setQuery("")}
                className="flex-1"
              />
              <div className="flex flex-wrap items-center justify-end gap-2">
                {filteredPending.length > 0 && (
                  <button
                    type="button"
                    onClick={discoverPending}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--kanso-line)] px-3 py-2 text-xs font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)] hover:bg-[var(--kanso-mint)]/10"
                  >
                    <Shuffle size={14} aria-hidden="true" />
                    {t("discoverPending")}
                  </button>
                )}
                <GalleryViewToggle
                  view={view}
                  onChange={setView}
                  labels={{
                    viewList: t("viewList"),
                    viewGrid: t("viewGrid"),
                  }}
                />
              </div>
            </div>
          </section>

          {pendingError ? (
            <ErrorState
              variant="inline"
              className="mt-10 max-w-xl"
              title={t("listenLaterError")}
              onRetry={() => fetchLibrary()}
            />
          ) : filteredPending.length === 0 ? (
            <CollectionEmptyState
              variant={query.trim() ? "listen-later-filtered" : "listen-later"}
              title={query.trim() ? t("noMatches") : t("noListenLater")}
              description={
                query.trim()
                  ? t("noMatchesDescription")
                  : t("listenLaterEmptyDescription")
              }
              actionLabel={
                query.trim() ? t("clearSearch") : t("listenLaterAddFirst")
              }
              onAction={() =>
                query.trim() ? setQuery("") : router.push("/search")
              }
            />
          ) : (
            <div className="mt-10">{renderPendingItems(filteredPending)}</div>
          )}
        </>
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
