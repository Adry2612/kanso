/* eslint-disable @next/next/no-img-element */
"use client";

import { openSpotify } from "@/lib/spotifyUtils";
import { useRecommendationHistory } from "@/hooks/client/useRecommendationHistory";
import { formatTime } from "@/utils/dates";
import {
  Clock3,
  Headphones,
  LayoutGrid,
  List,
  Music2,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { getMood, normalizeMoods } from "@/constants/moods";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";
import { Skeleton } from "@/components/Skeleton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
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
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={`history-skeleton-${index}`} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
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
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--kanso-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles
                  className="h-3.5 w-3.5 text-[var(--kanso-mint)]"
                  aria-hidden="true"
                />
                <strong className="font-semibold text-[var(--foreground)]">
                  {recomendationHistory.length}
                </strong>
                {totalLabel}
              </span>
              <span
                className="hidden h-3 w-px bg-[var(--kanso-line)] sm:block"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-1.5">
                <Users
                  className="h-3.5 w-3.5 text-[var(--kanso-mint)]"
                  aria-hidden="true"
                />
                <strong className="font-semibold text-[var(--foreground)]">
                  {uniqueArtists}
                </strong>
                {artistsLabel}
              </span>
              <span
                className="hidden h-3 w-px bg-[var(--kanso-line)] sm:block"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-1.5">
                <Music2
                  className="h-3.5 w-3.5 text-[var(--kanso-mint)]"
                  aria-hidden="true"
                />
                <strong className="font-semibold text-[var(--foreground)]">
                  {moods.length}
                </strong>
                {moodsLabel}
              </span>
            </div>
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
        <section className="mt-10 max-w-xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-7 text-center">
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
                <button
                  type="button"
                  onClick={() =>
                    setView((current) => (current === "grid" ? "list" : "grid"))
                  }
                  aria-label={view === "grid" ? t("viewList") : t("viewGrid")}
                  title={view === "grid" ? t("viewList") : t("viewGrid")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] px-3 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)]"
                >
                  {view === "grid" ? (
                    <List className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">
                    {view === "grid" ? t("viewList") : t("viewGrid")}
                  </span>
                </button>
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
            <section className="mt-8 max-w-xl rounded-2xl border border-dashed border-[var(--kanso-line)] p-7 text-center">
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
                  <div className="flex items-end justify-between gap-4 border-b border-[var(--kanso-line)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--kanso-mint)]" />
                      <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
                        {date}
                      </h2>
                    </div>
                    <span className="text-xs text-[var(--kanso-muted)]">
                      {items.length}{" "}
                      {t(
                        items.length === 1 ? "stats.totalOne" : "stats.total",
                      ).toLowerCase()}
                    </span>
                  </div>

                  {view === "grid" ? (
                    <Stagger
                      className="mt-5 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 xl:grid-cols-4"
                      stagger={0.03}
                      onMount
                    >
                      {items.map((recomendation) => {
                        const itemMoods = normalizeMoods(
                          recomendation.moods ?? [],
                        );
                        return (
                          <StaggerItem key={recomendation.id} y={12}>
                            <article className="group min-w-0">
                              <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)]">
                                <Link
                                  href={`/albums/${recomendation.album.id}`}
                                  className="absolute inset-0 z-10"
                                  aria-label={recomendation.album.name}
                                />
                                <img
                                  loading="lazy"
                                  decoding="async"
                                  src={recomendation.album.images[0]?.url}
                                  alt={recomendation.album.name}
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                                <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/35 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur">
                                  <Clock3
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                  {formatTime(recomendation.providedAt)}
                                </span>
                                <div className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap gap-1.5 pr-10">
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
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openSpotify(
                                      recomendation.album.external_urls
                                        ?.spotify,
                                    )
                                  }
                                  aria-label={t("listen")}
                                  className="absolute bottom-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur transition hover:bg-[var(--kanso-mint)] hover:text-[var(--background)]"
                                >
                                  <Headphones
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                              <div className="mt-3 min-w-0">
                                <Link
                                  href={`/albums/${recomendation.album.id}`}
                                  className="block truncate text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--kanso-mint)]"
                                >
                                  {recomendation.album.name}
                                </Link>
                                <p className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
                                  {recomendation.album.artists[0]?.name ||
                                    t("unknownArtist")}
                                </p>
                              </div>
                            </article>
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
                          <article
                            key={recomendation.id}
                            className="group flex items-center gap-3 py-3.5 sm:gap-4"
                          >
                            <Link
                              href={`/albums/${recomendation.album.id}`}
                              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-2)] sm:h-16 sm:w-16"
                              aria-label={recomendation.album.name}
                            >
                              <img
                                loading="lazy"
                                decoding="async"
                                src={recomendation.album.images[0]?.url}
                                alt={recomendation.album.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/albums/${recomendation.album.id}`}
                                className="block truncate text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--kanso-mint)]"
                              >
                                {recomendation.album.name}
                              </Link>
                              <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-[var(--kanso-muted)]">
                                <span className="truncate">
                                  {recomendation.album.artists[0]?.name ||
                                    t("unknownArtist")}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="inline-flex shrink-0 items-center gap-1">
                                  <Clock3
                                    className="h-3 w-3"
                                    aria-hidden="true"
                                  />
                                  {formatTime(recomendation.providedAt)}
                                </span>
                              </p>
                              {itemMoods.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {itemMoods.slice(0, 3).map((mood) => (
                                    <span
                                      key={mood}
                                      className="rounded-full bg-[var(--kanso-mint)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-mint)]"
                                    >
                                      <InlineEmoji
                                        emoji={getMood(mood)?.emoji}
                                      />
                                      {tMoods(mood)}
                                    </span>
                                  ))}
                                  {itemMoods.length > 3 && (
                                    <span className="rounded-full border border-[var(--kanso-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-muted)]">
                                      +{itemMoods.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                openSpotify(
                                  recomendation.album.external_urls?.spotify,
                                )
                              }
                              aria-label={t("listen")}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanso-line)] text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                            >
                              <Headphones
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>
                          </article>
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
