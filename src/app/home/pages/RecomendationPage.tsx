/* eslint-disable @next/next/no-img-element */
"use client";
import { useFetch } from "@/hooks/useFetch";
import { getAlbumTracklist } from "@/lib/api/albumInfo";
import {
  getRecomendation,
  getRecommendedAlbumByActivity,
  saveRecomendationHistory,
} from "@/lib/api/recomendation";
import {
  getActivityLabel,
  moodLabelToKey,
  type RecommendedAlbum,
} from "@/lib/activityRecommendations";
import { useTranslations } from "@/context/I18nContext";
import { useTransitionRouter } from "next-view-transitions";
import { Reveal } from "@/components/motion";
import { getMood } from "@/constants/moods";
import { getActivity } from "@/constants/activities";
import InlineEmoji from "@/components/InlineEmoji";
import { Skeleton } from "@/components/Skeleton";
import { openSpotify } from "@/lib/spotifyUtils";
import React, { useEffect, useState } from "react";
import { FaSpotify } from "react-icons/fa";

type TrackArtist = {
  name: string;
  id: string;
};

type Track = {
  name: string;
  track_number: number;
  artists: TrackArtist[];
};

type RecomendationsProps = {
  moods: string[];
  userId: string;
  activity?: string | null;
  format?: string;
  tags?: string[];
};

export default function RecomendationPage({
  moods,
  userId,
  activity = null,
  format = "all",
  tags = [],
}: RecomendationsProps) {
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tRecomendation = useTranslations("recommendation");
  const router = useTransitionRouter();
  const activityLabel = activity
    ? getActivityLabel(activity, tActivities)
    : null;
  const activityEmoji = activity ? getActivity(activity)?.emoji : undefined;
  const [recomendedAlbum, setRecomendedAlbum] = useState<RecommendedAlbum>();
  const [albumTracklist, setAlbumTracklist] = useState<Track[] | null>(null);
  const [tracklistLoading, setTracklistLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const { execute: recomendation, error, loading } = useFetch(getRecomendation);
  const { execute: tracklist } = useFetch(getAlbumTracklist);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    setNoMatch(false);

    if (activity) {
      setActivityLoading(true);
      setActivityError(null);
      getRecommendedAlbumByActivity(activity, format, moods, tags)
        .then((result) => {
          if (result.recommendedAlbum) {
            setRecomendedAlbum(result.recommendedAlbum);
            const historyMoods = result.recommendations[0]?.matchingMoods
              ?.length
              ? result.recommendations[0].matchingMoods
              : result.optimalMoods;

            if (historyMoods.length > 0) {
              saveRecomendationHistory(
                historyMoods,
                result.recommendedAlbum.albumId,
              ).catch((error: unknown) => {
                console.error(
                  "Error guardando historial de recomendación:",
                  error,
                );
              });
            }
          } else {
            setRecomendedAlbum(undefined);
            setActivityError(
              `No hay recomendaciones disponibles para ${activityLabel || activity}`,
            );
          }
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Error desconocido";
          setActivityError(message);
        })
        .finally(() => {
          setActivityLoading(false);
        });
      return;
    }

    recomendation(moods, format, tags).then((data) => {
      if (data) {
        setRecomendedAlbum(data);
        const firebaseAlbumId = data.albumId;

        saveRecomendationHistory(moods, firebaseAlbumId).catch(
          (error: unknown) => {
            console.error("Error guardando historial de recomendación:", error);
          },
        );
      } else {
        setNoMatch(true);
      }
    });
    // El efecto solo debe re-ejecutarse cuando cambian estos valores; incluir
    // los traductores o `recomendation` (recreados en cada render) provocaría bucles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, moods, userId, mounted, format, tags]);

  useEffect(() => {
    if (!recomendedAlbum?.albumId) {
      return;
    }

    setTracklistLoading(true);
    (async () => {
      try {
        const tracklistData = await tracklist(recomendedAlbum.albumId);
        if (tracklistData) {
          setAlbumTracklist(tracklistData);
        } else {
          setAlbumTracklist([]);
        }
      } catch {
        setAlbumTracklist([]);
      } finally {
        setTracklistLoading(false);
      }
    })();
  }, [recomendedAlbum?.albumId, tracklist]);

  const isLoading = activity ? activityLoading : loading;
  const activeError = activity ? activityError : error;

  if (!mounted || isLoading) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="pt-12 md:pt-16">
          <Skeleton className="h-3 w-24" />
          <div className="mt-8 grid gap-8 border-b border-[var(--kanso-line)] pb-10 md:grid-cols-[320px_1fr] md:gap-16">
            <Skeleton className="aspect-square w-full max-w-[320px] rounded-2xl" />
            <div className="space-y-4 pt-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-16 w-4/5" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>
          <div className="mt-10 max-w-2xl space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (activeError) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="pt-16" role="alert">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-red-400">
            {tRecomendation("empty.errorTitle")}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
            {activeError}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-7 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)] hover:text-[var(--foreground)]"
          >
            ← {tRecomendation("empty.back")}
          </button>
        </div>
      </main>
    );
  }

  if (noMatch) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="pt-16">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              {tRecomendation("empty.eyebrow")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
              {tRecomendation("empty.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
              {tRecomendation("empty.description")}
            </p>
            {moods.length > 0 && (
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {moods.map((mood) => {
                  const option = getMood(mood);
                  return (
                    <span
                      key={mood}
                      className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] px-3 py-1.5 text-xs text-[var(--kanso-muted)]"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[var(--kanso-mint)]"
                      >
                        {option?.emoji ?? "🎵"}
                      </span>
                      {option ? tMoods(option.key) : mood}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/search")}
                className="rounded-xl bg-[var(--kanso-mint)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
              >
                {tRecomendation("empty.cta")}
              </button>
              <button
                onClick={() => window.history.back()}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)] hover:text-[var(--foreground)]"
              >
                {tRecomendation("empty.back")}
              </button>
            </div>
          </Reveal>
        </div>
      </main>
    );
  }

  const albumInfo = recomendedAlbum?.albumInfo;
  if (!albumInfo) return null;
  return (
    <main className="kanso-main relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-950/40 to-transparent" />
      <div className="relative pt-12 md:pt-16">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs text-[var(--kanso-mint)] transition hover:text-[var(--foreground)]"
        >
          ← Volver
        </button>
        <section className="grid w-full items-start gap-8 border-b border-[var(--kanso-line)] pb-10 md:grid-cols-[320px_1fr] md:gap-16">
          <img
            loading="lazy"
            decoding="async"
            src={albumInfo.images[0]?.url}
            alt={albumInfo.name}
            className="aspect-square w-full max-w-[320px] rounded-2xl object-cover shadow-2xl"
          />
          <div className="flex min-w-0 flex-col pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              Recomendación para ti
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[var(--foreground)] md:text-7xl">
              {albumInfo.name}
            </h1>
            <h2 className="mt-4 text-base text-[var(--kanso-mint)]">
              {albumInfo.artists
                .map((artist: { name: string }) => artist.name)
                .join(", ")}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
              Un álbum seleccionado a partir de tu{" "}
              {activity
                ? `actividad: ${activityEmoji ? `${activityEmoji} ` : ""}${activityLabel || activity}`
                : "estado de ánimo y tus favoritos"}
              .
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button
                onClick={() => openSpotify(albumInfo.external_urls?.spotify)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
              >
                <FaSpotify />
                Escuchar en Spotify
              </button>
            </div>
            {recomendedAlbum.feelings?.length ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {recomendedAlbum.feelings.map((feeling) => (
                  <span
                    key={feeling.label}
                    className="rounded-full border border-[var(--kanso-line)] px-3 py-1.5 text-xs text-[var(--kanso-muted)]"
                  >
                    <InlineEmoji emoji={feeling.emoji} />
                    {tMoods(moodLabelToKey[feeling.label] ?? feeling.label)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
        <section className="mt-10 max-w-2xl">
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-[var(--foreground)]">
            Tracklist{" "}
            <span className="text-xs font-normal text-[var(--kanso-muted)]">
              {tracklistLoading
                ? "· Cargando"
                : albumTracklist
                  ? `· ${albumTracklist.length} pistas`
                  : ""}
            </span>
          </h2>
          {tracklistLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : albumTracklist?.length ? (
            <ul className="border-t border-[var(--kanso-line)]">
              {albumTracklist.map((track, index) => (
                <li
                  key={`${track.name}-${index}`}
                  className="grid grid-cols-[30px_1fr] items-center gap-3 border-b border-[var(--kanso-line)] px-1 py-3"
                >
                  <span className="text-xs text-[var(--kanso-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm text-[var(--kanso-muted)]">
                      {track.name}
                    </span>
                    <span className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--kanso-muted)]">
              No hay canciones disponibles para este álbum.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
