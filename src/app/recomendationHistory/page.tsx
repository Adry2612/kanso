"use client";

import { useAuth } from "@/context/AuthContext";
import { getRecomendationHistory } from "@/lib/api/recomendation";
import { groupByDate } from "@/utils/dateHelpers";
import React, { useEffect, useMemo, useState } from "react";
import { Music2, Search, Sparkles, Users } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { normalizeMoods, type MoodKey } from "@/constants/moods";
import { Skeleton } from "@/components/Skeleton";
import { Reveal } from "@/components/motion";
import { Link } from "next-view-transitions";
import HistoryCarousel, { type HistoryItem } from "./HistoryCarousel";

export default function RecomendationHistoryPage() {
  const t = useTranslations("history");
  const tMoods = useTranslations("moods");
  const { user } = useAuth();
  const [recomendationHistory, setRecomendationHistory] = useState<
    HistoryItem[]
  >([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<MoodKey | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user?.uid) {
      setRecomendationHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    getRecomendationHistory()
      .then(({ history }) => {
        if (!cancelled) setRecomendationHistory(history || []);
      })
      .catch((fetchError) => {
        console.error("Error fetching history:", fetchError);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, mounted, reloadToken]);

  const moods = useMemo(
    () =>
      normalizeMoods(
        recomendationHistory.flatMap((item) => item.moods ?? []),
      ).sort((a, b) => a.localeCompare(b)),
    [recomendationHistory],
  );

  const filteredHistory = useMemo(() => {
    const term = query.trim().toLowerCase();

    return recomendationHistory.filter((item) => {
      const matchesMood =
        !moodFilter || normalizeMoods(item.moods ?? []).includes(moodFilter);
      if (!matchesMood) return false;
      if (!term) return true;

      const artist = item.album?.artists?.[0]?.name ?? "";
      return `${item.album?.name ?? ""} ${artist}`.toLowerCase().includes(term);
    });
  }, [recomendationHistory, query, moodFilter]);

  const groups = useMemo(() => groupByDate(filteredHistory), [filteredHistory]);

  const uniqueArtists = useMemo(
    () =>
      new Set(
        recomendationHistory
          .map((item) => item.album?.artists?.[0]?.name)
          .filter(Boolean),
      ).size,
    [recomendationHistory],
  );

  const hasFilters = Boolean(query.trim() || moodFilter);
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
        <section className="mt-10 max-w-xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-7">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {t("error")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("errorDescription")}
          </p>
          <button
            type="button"
            onClick={() => setReloadToken((value) => value + 1)}
            className="mt-5 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:brightness-105"
          >
            {t("retry")}
          </button>
        </section>
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
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMoodFilter(null);
                  }}
                  className="rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)]"
                >
                  {t("clearFilters")}
                </button>
              )}
            </div>

            {moods.length > 0 && (
              <div className="history-filter-rail mt-3">
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
                onClick={() => {
                  setQuery("");
                  setMoodFilter(null);
                }}
                className="mt-5 rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-sm font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
              >
                {t("clearFilters")}
              </button>
            </section>
          ) : (
            <div className="mt-10 space-y-10">
              {Object.entries(groups).map(([date, items]) => (
                <HistoryCarousel key={date} date={date} items={items} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
