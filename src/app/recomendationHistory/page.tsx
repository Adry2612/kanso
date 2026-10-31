"use client";

import { openSpotify } from "@/lib/spotifyUtils";
import { useRecommendationHistory } from "@/hooks/client/useRecommendationHistory";
import { formatTime } from "@/utils/dates";
import { Music2, Search, Sparkles, Users } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { getMood, normalizeMoods } from "@/constants/moods";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import GalleryCard from "@/components/gallery/GalleryCard";
import GalleryGroupHeader from "@/components/gallery/GalleryGroupHeader";
import GalleryRow from "@/components/gallery/GalleryRow";
import GallerySkeleton from "@/components/gallery/GallerySkeleton";
import GalleryStats from "@/components/gallery/GalleryStats";
import GalleryViewToggle from "@/components/gallery/GalleryViewToggle";
import { Link } from "next-view-transitions";

export default function RecomendationHistoryPage() {
  const t = useTranslations("history");
  const tMoods = useTranslations("moods");
  const {
    history: recomendationHistory,
    mounted,
    loading,
    error,
    query,
    setQuery,
    moodFilter,
    setMoodFilter,
    view,
    setView,
    moods,
    filteredHistory,
    groups,
    uniqueArtists,
    hasFilters,
    clearFilters,
    retry,
  } = useRecommendationHistory();

  const totalLabel = t(
    recomendationHistory.length === 1 ? "stats.totalOne" : "stats.total",
  ).toLowerCase();
  const artistsLabel = t(
    uniqueArtists === 1 ? "stats.artistsOne" : "stats.artists",
  ).toLowerCase();
  const moodsLabel = t(
    moods.length === 1 ? "stats.moodsOne" : "stats.moods",
  ).toLowerCase();

  if (!mounted || loading) {
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

  return (
    <main className="kanso-main min-h-screen">
      <Reveal>
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            {t("pageTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("subtitle")}
          </p>
          {recomendationHistory.length > 0 && (
            <GalleryStats
              stats={[
                {
                  id: "total",
                  icon: Sparkles,
                  value: recomendationHistory.length,
                  label: totalLabel,
                },
                {
                  id: "artists",
                  icon: Users,
                  value: uniqueArtists,
                  label: artistsLabel,
                },
                {
                  id: "moods",
                  icon: Music2,
                  value: moods.length,
                  label: moodsLabel,
                },
              ]}
            />
          )}
        </section>
      </Reveal>

      {error ? (
        <ErrorState
          variant="page"
          className="mt-10"
          title={t("error")}
          description={t("errorDescription")}
          onRetry={retry}
          retryLabel={t("retry")}
        />
      ) : recomendationHistory.length === 0 ? (
        <section className="kanso-empty mt-10 max-w-xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-7">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-mint)]">
            <Music2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
            {t("noHistory")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("noHistoryDescription")}
          </p>
          <Link
            href="/home"
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:brightness-105"
          >
            {t("explore")}
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kanso-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="kanso-input w-full py-2.5 pl-10 pr-3 text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)] md:flex-none"
                  >
                    {t("clearFilters")}
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

            {moods.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={moodFilter === null}
                  onClick={() => setMoodFilter(null)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    moodFilter === null
                      ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                      : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                  }`}
                >
                  {t("allMoods")}
                </button>
                {moods.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    aria-pressed={moodFilter === mood}
                    onClick={() =>
                      setMoodFilter((current) =>
                        current === mood ? null : mood,
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      moodFilter === mood
                        ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                        : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                    }`}
                  >
                    <InlineEmoji emoji={getMood(mood)?.emoji} />
                    {tMoods(mood)}
                  </button>
                ))}
              </div>
            )}
          </section>

          {filteredHistory.length === 0 ? (
            <section className="kanso-empty mt-8 max-w-xl rounded-2xl border border-dashed border-[var(--kanso-line)] p-7">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {t("noMatches")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
                {t("noMatchesDescription")}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-sm font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
              >
                {t("clearFilters")}
              </button>
            </section>
          ) : (
            <div className="mt-10 space-y-10">
              {Object.entries(groups).map(([date, items]) => (
                <section key={date}>
                  <GalleryGroupHeader
                    label={date}
                    count={items.length}
                    countLabel={t(
                      items.length === 1 ? "stats.totalOne" : "stats.total",
                    ).toLowerCase()}
                  />

                  {view === "grid" ? (
                    <Stagger
                      className="kanso-album-grid kanso-album-grid--start mt-5"
                      stagger={0.03}
                      onMount
                    >
                      {items.map((recomendation) => {
                        const itemMoods = normalizeMoods(
                          recomendation.moods ?? [],
                        );
                        return (
                          <StaggerItem key={recomendation.id} y={12}>
                            <GalleryCard
                              href={`/albums/${recomendation.album.id}`}
                              image={recomendation.album.images[0]?.url}
                              title={recomendation.album.name}
                              artist={
                                recomendation.album.artists[0]?.name ||
                                t("unknownArtist")
                              }
                              timestampLabel={formatTime(
                                recomendation.providedAt,
                              )}
                              badges={
                                <>
                                  {itemMoods.slice(0, 2).map((mood) => (
                                    <span
                                      key={mood}
                                      className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur"
                                    >
                                      <InlineEmoji
                                        emoji={getMood(mood)?.emoji}
                                      />
                                      {tMoods(mood)}
                                    </span>
                                  ))}
                                  {itemMoods.length > 2 && (
                                    <span className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur">
                                      +{itemMoods.length - 2}
                                    </span>
                                  )}
                                </>
                              }
                              listenLabel={t("listen")}
                              onListen={() =>
                                openSpotify(
                                  recomendation.album.external_urls?.spotify,
                                )
                              }
                            />
                          </StaggerItem>
                        );
                      })}
                    </Stagger>
                  ) : (
                    <div className="mt-2 divide-y divide-[var(--kanso-line)]">
                      {items.map((recomendation) => {
                        const itemMoods = normalizeMoods(
                          recomendation.moods ?? [],
                        );
                        return (
                          <GalleryRow
                            key={recomendation.id}
                            href={`/albums/${recomendation.album.id}`}
                            image={recomendation.album.images[0]?.url}
                            title={recomendation.album.name}
                            artist={
                              recomendation.album.artists[0]?.name ||
                              t("unknownArtist")
                            }
                            timestampLabel={formatTime(
                              recomendation.providedAt,
                            )}
                            badges={
                              <>
                                {itemMoods.slice(0, 3).map((mood) => (
                                  <span
                                    key={mood}
                                    className="rounded-full bg-[var(--kanso-mint)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-mint)]"
                                  >
                                    <InlineEmoji emoji={getMood(mood)?.emoji} />
                                    {tMoods(mood)}
                                  </span>
                                ))}
                                {itemMoods.length > 3 && (
                                  <span className="rounded-full border border-[var(--kanso-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-muted)]">
                                    +{itemMoods.length - 3}
                                  </span>
                                )}
                              </>
                            }
                            listenLabel={t("listen")}
                            onListen={() =>
                              openSpotify(
                                recomendation.album.external_urls?.spotify,
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
