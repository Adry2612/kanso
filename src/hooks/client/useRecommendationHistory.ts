"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { getRecommendationHistory } from "@/services/client/recommendations";
import type { MoodKey } from "@/constants/moods";
import { groupByDate } from "@/utils/dates";
import {
  countHistoryArtists,
  filterRecommendationHistory,
  getHistoryMoods,
} from "@/utils/history";
import type { RecommendationHistoryItem } from "@/types/recommendations";

type HistoryView = "grid" | "list";

/**
 * Historial de recomendaciones: carga, reintento, búsqueda por texto, filtro
 * por emoción y vista de cuadrícula/lista.
 */
export function useRecommendationHistory() {
  const { user } = useAuth();
  const { locale } = useI18n();

  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<MoodKey | null>(null);
  const [view, setView] = useState<HistoryView>("grid");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user?.uid) {
      setHistory([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    getRecommendationHistory()
      .then((response) => {
        if (!cancelled) setHistory(response.history);
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

  const moods = useMemo(() => getHistoryMoods(history), [history]);

  const filteredHistory = useMemo(
    () => filterRecommendationHistory(history, query, moodFilter),
    [history, query, moodFilter],
  );

  const groups = useMemo(
    () => groupByDate(filteredHistory, (item) => item.providedAt, locale),
    [filteredHistory, locale],
  );

  const uniqueArtists = useMemo(() => countHistoryArtists(history), [history]);

  const hasFilters = Boolean(query.trim() || moodFilter);

  const clearFilters = () => {
    setQuery("");
    setMoodFilter(null);
  };

  const retry = () => setReloadToken((value) => value + 1);

  return {
    history,
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
  };
}
