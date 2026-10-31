"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getRecommendationHistory } from "@/services/client/recommendations";
import { getCollection } from "@/services/client/collection";
import { formatTodayLabel } from "@/utils/dates";
import { getRecentRecommendations } from "@/utils/history";
import type { CollectionTag } from "@/types/collection";
import type { RecommendationHistoryItem } from "@/types/recommendations";

/**
 * Datos de Inicio: fecha local, últimas recomendaciones y etiquetas de la
 * colección para la recomendación rápida.
 */
export function useHomeStart() {
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [collectionTags, setCollectionTags] = useState<CollectionTag[]>([]);
  const [collectionCount, setCollectionCount] = useState(0);
  const [collectionStatus, setCollectionStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha real del día, calculada tras montar para no desajustar la hidratación.
  useEffect(() => {
    if (!mounted) return;
    setToday(formatTodayLabel(document.documentElement.lang));
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setHistoryError(null);

    getRecommendationHistory()
      .then((response) => {
        if (!cancelled) setHistory(response.history);
      })
      .catch((fetchError) => {
        console.error("Error fetching history:", fetchError);
        if (!cancelled) {
          setHistoryError(
            "No pudimos cargar tus recomendaciones. Inténtalo de nuevo más tarde.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setCollectionTags([]);
      setCollectionCount(0);
      setCollectionStatus("ready");
      return;
    }

    let cancelled = false;
    setCollectionStatus("loading");

    getCollection()
      .then((collection) => {
        if (cancelled) return;

        const unique = new Map<string, CollectionTag>();
        collection
          .flatMap((entry) => entry.tags ?? [])
          .forEach((tag) => unique.set(`${tag.category}:${tag.value}`, tag));
        setCollectionTags(Array.from(unique.values()));
        setCollectionCount(collection.length);
        setCollectionStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setCollectionTags([]);
          setCollectionCount(0);
          setCollectionStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const recentRecommendations = useMemo(
    () => getRecentRecommendations(history),
    [history],
  );

  return {
    mounted,
    today,
    history,
    loading,
    historyError,
    recentRecommendations,
    collectionTags,
    collectionCount,
    collectionStatus,
  };
}
