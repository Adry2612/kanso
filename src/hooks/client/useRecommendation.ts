"use client";

import { useEffect, useRef, useState } from "react";
import { getAlbumTracklist } from "@/services/client/albums";
import { getCollection } from "@/services/client/collection";
import {
  getRecommendation,
  getRecommendedAlbumByActivity,
  saveRecommendationHistory,
} from "@/services/client/recommendations";
import type { Track } from "@/types/album";
import type {
  RecommendationExplanation,
  RecommendedAlbum,
} from "@/types/recommendations";

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
  const [explain, setExplain] = useState<RecommendationExplanation>();
  const [albumTracklist, setAlbumTracklist] = useState<Track[] | null>(null);
  const [tracklistLoading, setTracklistLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [collectionEmpty, setCollectionEmpty] = useState<boolean | null>(null);

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
    setCollectionEmpty(null);
    setError(false);
    setExplain(undefined);
    setLoading(true);

    // Solo se consulta la colección cuando no hay resultado: así el estado
    // normal no paga una petición extra y el vacío puede distinguir entre
    // «no tienes colección» y «no hay coincidencias».
    const markNoMatch = () => {
      setNoMatch(true);
      getCollection()
        .then((collection) => {
          if (!cancelled) setCollectionEmpty(collection.length === 0);
        })
        .catch(() => {
          if (!cancelled) setCollectionEmpty(null);
        });
    };

    if (activity) {
      getRecommendedAlbumByActivity(
        activity,
        format,
        moodsRef.current,
        tagsRef.current,
      )
        .then((result) => {
          if (cancelled) return;
          setExplain(result.explain);

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
            markNoMatch();
          }
        })
        .catch((recommendationError: unknown) => {
          if (cancelled) return;
          console.error(
            "No se pudo cargar la recomendación:",
            recommendationError,
          );
          setError(true);
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
        setExplain(data?.explain);

        if (data) {
          setRecommendedAlbum({
            albumId: data.albumId,
            labeledFeelings: data.labeledFeelings ?? [],
            activities: data.activities ?? [],
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
          markNoMatch();
        }
      })
      .catch((recommendationError: unknown) => {
        if (cancelled) return;
        console.error(
          "No se pudo cargar la recomendación:",
          recommendationError,
        );
        setError(true);
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
    collectionEmpty,
    recommendedAlbum,
    explain,
    albumTracklist,
    tracklistLoading,
  };
}
