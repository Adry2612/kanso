import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFavoritesFilter } from "@/hooks/useFavoritesFilter";
import { getCollection } from "@/services/client/favorites";
import { getListenLater } from "@/services/client/listenLater";
import {
  countActiveFilters,
  filterFavoritesByQuery,
  getAvailableMoods,
  getAvailableTags,
  hasCollectionFilters,
  sortKeyToI18nKey,
  tagCategoryI18nKey,
} from "@/utils/favorites";
import { filterListenLaterByQuery, sortListenLater } from "@/utils/listenLater";
import { tagKey } from "@/utils/tags";
import type {
  CollectionFavorite,
  CollectionFilters,
  FavoritesTab,
  ListenLaterItem,
  SortMethod,
} from "@/types/favorites";

const emptyFilters: CollectionFilters = {
  moods: [],
  genres: [],
  formats: [],
  tags: [],
};

export function useFavoritesPage(translateMood?: (mood: string) => string) {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<CollectionFavorite[]>([]);
  const [pending, setPending] = useState<ListenLaterItem[]>([]);
  const [activeTab, setActiveTab] = useState<FavoritesTab>("collection");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortMethod>("");
  const [filters, setFilters] = useState<CollectionFilters>(emptyFilters);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setPendingLoading(true);
    setError(null);
    setPendingError(null);

    const [favoritesResult, pendingResult] = await Promise.allSettled([
      getCollection(),
      getListenLater(),
    ]);

    if (favoritesResult.status === "fulfilled") {
      setFavorites(favoritesResult.value);
    } else {
      setError("No pudimos cargar tu colección. Inténtalo de nuevo.");
    }

    if (pendingResult.status === "fulfilled") {
      setPending(pendingResult.value);
    } else {
      setPendingError("No pudimos cargar tus pendientes. Inténtalo de nuevo.");
    }

    setLoading(false);
    setPendingLoading(false);
  }, []);

  const searchedFavorites = useMemo(
    () => filterFavoritesByQuery(favorites, query),
    [favorites, query],
  );

  const { groupedFavorites } = useFavoritesFilter(
    searchedFavorites,
    sortBy,
    filters,
  );

  const availableMoods = useMemo(
    () => getAvailableMoods(favorites, translateMood),
    [favorites, translateMood],
  );

  const orderedPending = useMemo(() => sortListenLater(pending), [pending]);

  const filteredPending = useMemo(
    () => filterListenLaterByQuery(orderedPending, query),
    [orderedPending, query],
  );

  const hasFilters = hasCollectionFilters(query, filters);
  const activeFilterCount = countActiveFilters(filters);
  const sortLabelKey = sortBy ? sortKeyToI18nKey(sortBy) : "";

  const availableTags = useMemo(() => getAvailableTags(favorites), [favorites]);

  const clearFilters = useCallback(() => {
    setQuery("");
    setFilters(emptyFilters);
  }, []);

  const clearMoods = useCallback(() => {
    setFilters((current) => ({ ...current, moods: [] }));
  }, []);

  const toggleMood = useCallback((mood: string) => {
    setFilters((current) => ({
      ...current,
      moods: current.moods.includes(mood)
        ? current.moods.filter((item) => item !== mood)
        : [...current.moods, mood],
    }));
  }, []);

  const removeGenre = useCallback((genre: string) => {
    setFilters((current) => ({
      ...current,
      genres: current.genres.filter((item) => item !== genre),
    }));
  }, []);

  const removeFormat = useCallback(
    (format: CollectionFilters["formats"][number]) => {
      setFilters((current) => ({
        ...current,
        formats: current.formats.filter((item) => item !== format),
      }));
    },
    [],
  );

  const removeTag = useCallback((tag: CollectionFilters["tags"][number]) => {
    setFilters((current) => ({
      ...current,
      tags: current.tags.filter((item) => tagKey(item) !== tagKey(tag)),
    }));
  }, []);

  const categoryLabelKey = tagCategoryI18nKey;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "listen-later") {
      setActiveTab("listenLater");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.uid) {
      fetchLibrary();
    } else {
      setLoading(false);
      setPendingLoading(false);
    }
  }, [user?.uid, authLoading, fetchLibrary]);

  return {
    favorites,
    pending,
    activeTab,
    setActiveTab,
    mounted,
    loading,
    pendingLoading,
    error,
    pendingError,
    showSortModal,
    setShowSortModal,
    showFilterModal,
    setShowFilterModal,
    query,
    setQuery,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    fetchLibrary,
    groupedFavorites,
    availableMoods,
    orderedPending,
    filteredPending,
    hasFilters,
    activeFilterCount,
    sortLabelKey,
    availableTags,
    clearFilters,
    clearMoods,
    toggleMood,
    removeGenre,
    removeFormat,
    removeTag,
    categoryLabelKey,
  };
}
