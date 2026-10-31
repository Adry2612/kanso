"use client";

import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import SearchArtists from "@/app/search/components/SearchArtists";
import { useTranslations } from "@/context/I18nContext";
import { tagDisplayLabel } from "@/constants/taxonomy";
import AlbumCard from "@/components/AlbumCard";
import {
  AlbumGridSkeleton,
  CollectionSkeleton,
} from "@/components/ContentSkeletons";
import { Skeleton } from "@/components/Skeleton";
import { getMood } from "@/constants/moods";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";
import { Link } from "next-view-transitions";
import { Stagger, StaggerItem } from "@/components/motion";
import { useSearchPage } from "@/hooks/client/useSearchPage";
import { tagCategoryI18nKey } from "@/utils/collection";

export default function SearchPage() {
  const t = useTranslations("search");
  const tTags = useTranslations("tags");
  const tTaxonomy = useTranslations("taxonomy");
  const {
    query,
    setQuery,
    mounted,
    debouncedQuery,
    result,
    loading,
    error,
    retry,
    collectionByAlbum,
    pendingByAlbum,
    collectionLoaded,
    collectionError,
    communitySearches,
    communityAlbums,
    collectionMoods,
    collectionTags,
    openModal,
    selectedAlbum,
    selectedIsInCollection,
    selectedIsPending,
    selectedPendingData,
    selectedCollectionData,
    openAlbumModal,
    closeAlbumModal,
    handleSaved,
    handlePendingSaved,
    handlePendingRemoved,
  } = useSearchPage();

  const tagCategoryLabel = (category: string) =>
    tTags(tagCategoryI18nKey(category));

  const artists = (result?.artists?.items ?? []).slice(0, 4);
  const albums = result?.albums?.items ?? [];

  return (
    <main className="kanso-main min-h-screen">
      <section className="flex max-w-5xl flex-col justify-between gap-7 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
            Explora tu próxima escucha
          </p>
          <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
            {t("title")}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
          {t("subtitle")}
        </p>
      </section>
      <input
        type="text"
        placeholder={t("placeholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="kanso-input mt-8 mb-10 w-full max-w-2xl px-5 py-4 text-sm placeholder:text-[var(--kanso-muted)]"
      />

      {error && (
        <ErrorState
          variant="inline"
          className="mb-6"
          title={t("error")}
          description={t("errorDescription")}
          onRetry={retry}
        />
      )}

      <div className="w-full pb-16">
        {loading && (
          <div role="status" aria-busy="true">
            <span className="sr-only">{t("loading")}</span>
            <Skeleton className="mb-5 h-6 w-56" />
            <AlbumGridSkeleton withAction variant="plain" />
          </div>
        )}
        {mounted && result && !loading && (
          <>
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {t("resultsTitle")}:{" "}
              <span className="text-[var(--kanso-mint)]">{debouncedQuery}</span>
            </h2>

            <SearchArtists artists={artists} />

            {albums.length > 0 ? (
              <Stagger
                className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
                stagger={0.04}
                onMount
              >
                {albums.map((album) => (
                  <StaggerItem key={album.id}>
                    <AlbumCard
                      album={album}
                      variant="plain"
                      isInCollection={collectionByAlbum.has(album.id)}
                      isPending={
                        !collectionByAlbum.has(album.id) &&
                        pendingByAlbum.has(album.id)
                      }
                      onAdd={() => openAlbumModal(album)}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : artists.length > 0 ? (
              <section className="kanso-empty max-w-2xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-8">
                <p className="text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("noAlbumsFound")}
                </p>
              </section>
            ) : (
              <section className="kanso-empty max-w-2xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
                  {t("noResults")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {t("noResultsTitle")}
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("noResultsDescription")}
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-6 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
                >
                  {t("clearSearch")}
                </button>
                {(collectionMoods.length > 0 || collectionTags.length > 0) && (
                  <div className="mt-8 border-t border-[var(--kanso-line)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {t("tryCollection")}
                    </h3>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      {collectionMoods.map((mood) => {
                        const item = getMood(mood);
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => setQuery(item?.label || mood)}
                            className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                          >
                            <InlineEmoji emoji={item?.emoji} />
                            {item?.label}
                          </button>
                        );
                      })}
                      {collectionTags.map((tag) => (
                        <button
                          key={`${tag.category}-${tag.value}`}
                          type="button"
                          onClick={() => setQuery(tag.value)}
                          className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                        >
                          {tagCategoryLabel(tag.category)}:{" "}
                          {tagDisplayLabel(tag, tTaxonomy)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
            {openModal && selectedAlbum && (
              <SelectedAlbumModal
                isOpen={openModal}
                onClose={closeAlbumModal}
                album={selectedAlbum}
                isInCollection={selectedIsInCollection}
                isPending={selectedIsPending}
                pendingData={selectedPendingData}
                startEditing={selectedIsInCollection}
                collectionData={selectedCollectionData}
                onSaved={handleSaved}
                onPendingSaved={handlePendingSaved}
                onPendingRemoved={handlePendingRemoved}
              />
            )}
          </>
        )}
        {mounted && !result && !loading && !error && (
          <section className="mt-2 space-y-10">
            <div className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-7">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {t("communityAlbumsTitle")}
              </h2>
              {communityAlbums.length > 0 ? (
                <Stagger
                  className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
                  stagger={0.04}
                  onMount
                >
                  {communityAlbums.map((album) => (
                    <StaggerItem key={album.id}>
                      <AlbumCard album={album} variant="plain" />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <p className="kanso-empty mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("communityAlbumsEmpty")}
                </p>
              )}
            </div>
            {communitySearches.length > 0 && (
              <div className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-7">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {t("communityTitle")}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {communitySearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="kanso-empty max-w-2xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-7">
              <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
                {t("emptySearchPrompt")}
              </p>
              {collectionMoods.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">
                    Tu colección, por emociones
                  </h2>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {collectionMoods.map((mood) => {
                      const item = getMood(mood);
                      return (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setQuery(item?.label || mood)}
                          className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                        >
                          <InlineEmoji emoji={item?.emoji} />
                          {item?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {collectionTags.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">
                    Explora por tus etiquetas
                  </h2>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {collectionTags.map((tag) => (
                      <button
                        key={`${tag.category}-${tag.value}`}
                        type="button"
                        onClick={() => setQuery(tag.value)}
                        className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                      >
                        {tagCategoryLabel(tag.category)}:{" "}
                        {tagDisplayLabel(tag, tTaxonomy)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!collectionLoaded && (
                <div role="status" aria-busy="true">
                  <span className="sr-only">{t("loadingCollection")}</span>
                  <CollectionSkeleton />
                </div>
              )}
              {collectionError && (
                <ErrorState
                  variant="inline"
                  className="mt-5"
                  title={t("collectionLoadError")}
                  onRetry={() => window.location.reload()}
                />
              )}
              {collectionLoaded &&
                !collectionError &&
                collectionMoods.length === 0 &&
                collectionTags.length === 0 && (
                  <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
                    {collectionByAlbum.size === 0 ? (
                      <>
                        {t("emptyCollection")}{" "}
                        <Link
                          href="/collection"
                          className="font-semibold text-[var(--kanso-mint)] underline"
                        >
                          {t("exploreDiscs")}
                        </Link>
                      </>
                    ) : (
                      t("collectionNeedsTags")
                    )}
                  </p>
                )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
