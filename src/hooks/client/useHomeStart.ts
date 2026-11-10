"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { canonicalizeTags } from "@/constants/taxonomy";
import { getRecommendationHistory } from "@/services/client/recommendations";
import { getCollection } from "@/services/client/collection";
import { getListenLater } from "@/services/client/listenLater";
import { formatTodayLabel } from "@/utils/dates";
import { getRecentRecommendations } from "@/utils/history";
import { getRecentListenLater } from "@/utils/listenLater";
import { countCollectionArtists } from "@/utils/collection";
import type { CollectionTag, ListenLaterItem } from "@/types/collection";
import type { RecommendationHistoryItem } from "@/types/recommendations";

/**
 * Datos de Inicio: fecha local, últimas recomendaciones, pendientes y un
 * resumen de la colección para la recomendación rápida.
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
  const [collectionArtists, setCollectionArtists] = useState(0);
  const [collectionStatus, setCollectionStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [pending, setPending] = useState<ListenLaterItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [pendingReload, setPendingReload] = useState(0);

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
      setCollectionArtists(0);
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
          .flatMap((entry) => canonicalizeTags(entry.tags ?? []))
          .forEach((tag) => unique.set(`${tag.category}:${tag.value}`, tag));
        setCollectionTags(Array.from(unique.values()));
        setCollectionCount(collection.length);
        setCollectionArtists(countCollectionArtists(collection));
        setCollectionStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setCollectionTags([]);
          setCollectionCount(0);
          setCollectionArtists(0);
          setCollectionStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!mounted) return;

    if (!user?.uid) {
      setPending([]);
      setPendingLoading(false);
      setPendingError(null);
      return;
    }

    let cancelled = false;
    setPendingLoading(true);
    setPendingError(null);

    getListenLater()
      .then((albums) => {
        if (!cancelled) setPending(albums);
      })
      .catch((fetchError) => {
        console.error("Error fetching listen later:", fetchError);
        if (!cancelled) {
          setPendingError(
            "No pudimos cargar tus pendientes. Inténtalo de nuevo más tarde.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setPendingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted, pendingReload, user?.uid]);

  const recentRecommendations = useMemo(
    () => getRecentRecommendations(history),
    [history],
  );

  const recentPending = useMemo(() => getRecentListenLater(pending), [pending]);

  const retryPending = useCallback(() => {
    setPendingReload((value) => value + 1);
  }, []);

  return {
    mounted,
    today,
    history,
    loading,
    historyError,
    recentRecommendations,
    collectionTags,
    collectionCount,
    collectionArtists,
    collectionStatus,
    recentPending,
    pendingCount: pending.length,
    pendingLoading,
    pendingError,
    retryPending,
  };
}
