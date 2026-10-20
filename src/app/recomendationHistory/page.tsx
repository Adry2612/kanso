/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuth } from "@/context/AuthContext";
import { getRecomendationHistory } from "@/lib/api/recomendation";
import { openSpotify } from "@/lib/spotifyUtils";
import { formatTime, groupByDate } from "@/utils/dateHelpers";
import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Headphones,
  Music2,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { normalizeMoods, type MoodKey } from "@/constants/moods";
import { Skeleton } from "@/components/Skeleton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Link } from "next-view-transitions";

type HistoryItem = {
  id: string;
  providedAt: string;
  moods?: string[];
  album: {
    name: string;
    images: { url: string }[];
    artists: { name: string }[];
    external_urls?: { spotify?: string };
  };
};

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

  if (!mounted || loading) {
    return (
      <main className="kanso-main min-h-screen">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-14 w-80 max-w-full" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="mt-10 border-t border-[var(--kanso-line)]">
          {[...Array(4)].map((_, index) => (
            <div
              key={`history-skeleton-${index}`}
              className="flex items-center gap-4 border-b border-[var(--kanso-line)] py-4"
            >
              <Skeleton className="h-14 w-14 rounded-lg md:h-[70px] md:w-[70px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-3 w-32 max-w-full" />
              </div>
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
          <h1 className="mt-3 break-words text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("subtitle")}
          </p>
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
          <section className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              {
                key: "total",
                label: t("stats.total"),
                value: recomendationHistory.length,
                icon: Sparkles,
              },
              {
                key: "artists",
                label: t("stats.artists"),
                value: uniqueArtists,
                icon: Users,
              },
              {
                key: "moods",
                label: t("stats.moods"),
                value: moods.length,
                icon: Music2,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-4"
                >
                  <div className="flex items-center gap-2 text-[var(--kanso-muted)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <p className="text-[10px] font-bold uppercase tracking-[.16em]">
                      {stat.label}
                    </p>
                  </div>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mt-6 rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-3 sm:p-4">
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
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setMoodFilter(null);
                }}
                disabled={!hasFilters}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("clearFilters")}
              </button>
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
            <div className="mt-8">
              {Object.entries(groups).map(([date, items]) => (
                <section key={date} className="mt-8 first:mt-0">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[var(--kanso-mint)]" />
                    <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
                      {date}
                    </h2>
                    <span className="text-xs text-[var(--kanso-muted)]">
                      {items.length}
                    </span>
                  </div>
                  <Stagger
                    className="mt-2 border-t border-[var(--kanso-line)]"
                    stagger={0.04}
                    onMount
                  >
                    {items.map((recomendation) => (
                      <StaggerItem key={recomendation.id} y={12}>
                        <article className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--kanso-line)] py-4 md:grid-cols-[70px_minmax(0,1fr)_auto] md:gap-5">
                          <img
                            loading="lazy"
                            decoding="async"
                            src={recomendation.album.images[0]?.url}
                            alt={recomendation.album.name}
                            className="h-14 w-14 rounded-lg object-cover md:h-[70px] md:w-[70px]"
                          />
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[var(--foreground)] md:text-base">
                                  {recomendation.album.name}
                                </p>
                                <p className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
                                  {recomendation.album.artists[0]?.name ||
                                    t("unknownArtist")}
                                </p>
                              </div>
                              <span className="hidden shrink-0 items-center gap-1 text-xs text-[var(--kanso-muted)] md:flex">
                                <Clock3
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                {formatTime(recomendation.providedAt)}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {normalizeMoods(recomendation.moods ?? []).map(
                                (mood) => (
                                  <span
                                    key={mood}
                                    className="rounded-full bg-[var(--kanso-mint)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-mint)]"
                                  >
                                    {tMoods(mood)}
                                  </span>
                                ),
                              )}
                              <span className="flex items-center gap-1 text-xs text-[var(--kanso-muted)] md:hidden">
                                <Clock3
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                {formatTime(recomendation.providedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2 md:col-span-1 md:self-center">
                            <button
                              type="button"
                              onClick={() =>
                                openSpotify(
                                  recomendation.album.external_urls?.spotify,
                                )
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-2.5 text-xs font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)] md:w-auto"
                            >
                              <Headphones
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              {t("listen")}
                            </button>
                          </div>
                        </article>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
