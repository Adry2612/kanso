"use client";

import { useEffect, useRef, useState } from "react";
import { getAlbumTracklist } from "@/services/client/albums";
import {
  getRecommendation,
  getRecommendedAlbumByActivity,
  saveRecommendationHistory,
} from "@/services/client/recommendations";
import type { Track } from "@/types/album";
import type { RecommendedAlbum } from "@/types/recommendations";

type Options = {
  moods: string[];
  userId: string;
  activity?: string | null;
  format?: string;
  tags?: string[];
  activityLabel?: string | null;
};

/**
 * Resuelve la recomendación de la pantalla (emoción o actividad), guarda el
 * historial y carga la tracklist del álbum elegido.
 */
export function useRecommendation({
  moods,
  userId,
  activity = null,
  format = "all",
  tags = [],
  activityLabel = null,
}: Options) {
  const [recommendedAlbum, setRecommendedAlbum] = useState<RecommendedAlbum>();
  const [albumTracklist, setAlbumTracklist] = useState<Track[] | null>(null);
  const [tracklistLoading, setTracklistLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const moodsRef = useRef(moods);
  const tagsRef = useRef(tags);
  moodsRef.current = moods;
  tagsRef.current = tags;

  const moodsKey = moods.join(",");
  const tagsKey = tags.join(",");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    setNoMatch(false);
    setError(null);
    setLoading(true);

    if (activity) {
      getRecommendedAlbumByActivity(
        activity,
        format,
        moodsRef.current,
        tagsRef.current,
      )
        .then((result) => {
          if (cancelled) return;

          if (result.recommendedAlbum) {
            setRecommendedAlbum(result.recommendedAlbum);
            const historyMoods = result.recommendations[0]?.matchingMoods
              ?.length
              ? result.recommendations[0].matchingMoods
              : result.optimalMoods;

            if (historyMoods.length > 0) {
              saveRecommendationHistory(
                historyMoods,
                result.recommendedAlbum.albumId,
              ).catch((historyError: unknown) => {
                console.error(
                  "Error guardando historial de recomendación:",
                  historyError,
                );
              });
            }
          } else {
            setRecommendedAlbum(undefined);
            setError(
              `No hay recomendaciones disponibles para ${activityLabel || activity}`,
            );
          }
        })
        .catch((recommendationError: unknown) => {
          if (cancelled) return;
          setError(
            recommendationError instanceof Error
              ? recommendationError.message
              : "Error desconocido",
          );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    getRecommendation(moodsRef.current, format, tagsRef.current)
      .then((data) => {
        if (cancelled) return;

        if (data) {
          setRecommendedAlbum({
            albumId: data.albumId,
            labeledFeelings: [],
            feelings: [],
            albumInfo: data.albumInfo,
          });

          saveRecommendationHistory(moodsRef.current, data.albumId).catch(
            (historyError: unknown) => {
              console.error(
                "Error guardando historial de recomendación:",
                historyError,
              );
            },
          );
        } else {
          setNoMatch(true);
        }
      })
      .catch((recommendationError: unknown) => {
        if (cancelled) return;
        setError(
          recommendationError instanceof Error
            ? recommendationError.message
            : "Error desconocido",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activity, activityLabel, format, mounted, moodsKey, tagsKey, userId]);

  useEffect(() => {
    const albumId = recommendedAlbum?.albumId;
    if (!albumId) return;

    let cancelled = false;
    setTracklistLoading(true);

    getAlbumTracklist(albumId)
      .then((tracks) => {
        if (!cancelled) setAlbumTracklist(tracks);
      })
      .catch(() => {
        if (!cancelled) setAlbumTracklist([]);
      })
      .finally(() => {
        if (!cancelled) setTracklistLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recommendedAlbum?.albumId]);

  return {
    mounted,
    loading,
    error,
    noMatch,
    recommendedAlbum,
    albumTracklist,
    tracklistLoading,
  };
}
