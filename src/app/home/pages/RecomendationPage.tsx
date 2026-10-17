/* eslint-disable @next/next/no-img-element */
"use client";
import { useFetch } from "@/hooks/useFetch";
import { getAlbumTracklist } from "@/lib/api/albumInfo";
import {
  getRecomendation,
  saveRecomendationHistory,
} from "@/lib/api/recomendation";
import {
  getRecommendedAlbumByActivity,
  getActivityLabel,
  type RecommendedAlbum,
} from "@/lib/activityRecommendations";
import { useTranslations } from "@/context/I18nContext";
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

type AlbumInfo = {
  spotifyUrl: string;
  images: { url: string }[];
  name: string;
  artists: { name: string; id: string }[];
  release_date: string;
  total_tracks: number;
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
  const activityLabel = activity
    ? getActivityLabel(activity, tActivities)
    : null;
  const [recomendedAlbum, setRecomendedAlbum] = useState<RecommendedAlbum>();
  const [albumTracklist, setAlbumTracklist] = useState<Track[] | null>(null);
  const [tracklistLoading, setTracklistLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  const { execute: recomendation, error, loading } = useFetch(getRecomendation);
  const { execute: tracklist } = useFetch(getAlbumTracklist);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (activity) {
      setActivityLoading(true);
      setActivityError(null);
      getRecommendedAlbumByActivity(
        userId,
        activity,
        tMoods,
        tActivities,
        format,
        moods,
        tags,
      )
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
                userId,
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

    recomendation(moods, userId, format, tags).then((data) => {
      if (data) {
        setRecomendedAlbum(data);
        const firebaseAlbumId = data.albumId;

        saveRecomendationHistory(moods, firebaseAlbumId, userId).catch(
          (error: unknown) => {
            console.error("Error guardando historial de recomendación:", error);
          },
        );
      }
    });
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
      <main className="collectify-main min-h-screen">
        <div className="pt-12 md:pt-16">
          <Skeleton className="h-3 w-24" />
          <div className="mt-8 grid gap-8 border-b border-emerald-100/10 pb-10 md:grid-cols-[320px_1fr] md:gap-16">
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
      <main className="collectify-main min-h-screen">
        <div className="pt-16">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-red-400">
            No hemos encontrado un álbum
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#8f9f93]">
            {activeError}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-7 rounded-xl border border-emerald-200/15 px-4 py-3 text-sm text-[#b4c2b6] transition hover:border-[#9be7a5] hover:text-white"
          >
            ← Volver a elegir
          </button>
        </div>
      </main>
    );
  }

  if (!recomendedAlbum) return null;

  const albumInfo = recomendedAlbum.albumInfo;
  return (
    <main className="collectify-main relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-emerald-950/40 to-transparent" />
      <div className="relative pt-12 md:pt-16">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs text-[#9be7a5] transition hover:text-white"
        >
          ← Volver
        </button>
        <section className="grid w-full items-start gap-8 border-b border-emerald-100/10 pb-10 md:grid-cols-[320px_1fr] md:gap-16">
          <img
            src={albumInfo.images[0]?.url}
            alt={albumInfo.name}
            className="aspect-square w-full max-w-[320px] rounded-2xl object-cover shadow-2xl"
          />
          <div className="flex min-w-0 flex-col pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9be7a5]">
              Recomendación para ti
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white md:text-7xl">
              {albumInfo.name}
            </h1>
            <h2 className="mt-4 text-base text-[#9be7a5]">
              {albumInfo.artists
                .map((artist: { name: string }) => artist.name)
                .join(", ")}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#8f9f93]">
              Un álbum seleccionado a partir de tu{" "}
              {activity
                ? `actividad: ${activityLabel || activity}`
                : "estado de ánimo y tus favoritos"}
              .
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button
                onClick={() => openSpotify(albumInfo.spotifyUrl)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#9be7a5] px-4 py-3 text-sm font-semibold text-[#102117] transition hover:bg-[#d6f28d]"
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
                    className="rounded-full border border-emerald-200/15 px-3 py-1.5 text-xs text-[#b4c2b6]"
                  >
                    {feeling.emoji} {feeling.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>
        <section className="mt-10 max-w-2xl">
          <h2 className="mb-3 text-lg font-semibold tracking-tight text-white">
            Tracklist{" "}
            <span className="text-xs font-normal text-[#8f9f93]">
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
            <ul className="border-t border-emerald-100/10">
              {albumTracklist.map((track, index) => (
                <li
                  key={`${track.name}-${index}`}
                  className="grid grid-cols-[30px_1fr] items-center gap-3 border-b border-emerald-100/10 px-1 py-3"
                >
                  <span className="text-xs text-[#8f9f93]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm text-[#b4c2b6]">
                      {track.name}
                    </span>
                    <span className="mt-1 truncate text-xs text-[#8f9f93]">
                      {track.artists.map((artist) => artist.name).join(", ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#8f9f93]">
              No hay canciones disponibles para este álbum.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
