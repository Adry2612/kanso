import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useCollectionFilter } from "@/hooks/client/useCollectionFilter";
import { getCollection } from "@/services/client/collection";
import { getListenLater } from "@/services/client/listenLater";
import {
  countActiveFilters,
  countCollectionArtists,
  countCollectionMoods,
  countDistinctArtists,
  filterCollectionByQuery,
  getAvailableMoods,
  getAvailableTags,
  getCollectionInsights,
  hasCollectionFilters,
  sortKeyToI18nKey,
  tagCategoryI18nKey,
} from "@/utils/collection";
import { filterListenLaterByQuery, sortListenLater } from "@/utils/listenLater";
import { tagKey } from "@/utils/tags";
import type {
  CollectionAlbum,
  CollectionFilters,
  CollectionTab,
  CollectionView,
  ListenLaterItem,
  SortMethod,
} from "@/types/collection";

const emptyFilters: CollectionFilters = {
  groupBy: "none",
  incompleteOnly: false,
  moods: [],
  genres: [],
  formats: [],
  tags: [],
};

export function useCollectionPage(translateMood?: (mood: string) => string) {
  const { user, loading: authLoading } = useAuth();
  const { locale } = useI18n();
  const [collection, setCollection] = useState<CollectionAlbum[]>([]);
  const [pending, setPending] = useState<ListenLaterItem[]>([]);
  const [activeTab, setActiveTab] = useState<CollectionTab>("collection");
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
  const [view, setView] = useState<CollectionView>("grid");
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const fetchLibrary = useCallback(async () => {
    setLoading(true);
    setPendingLoading(true);
    setError(null);
    setPendingError(null);

    const [collectionResult, pendingResult] = await Promise.allSettled([
      getCollection(),
      getListenLater(),
    ]);

    if (collectionResult.status === "fulfilled") {
      setCollection(collectionResult.value);
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

  const searchedCollection = useMemo(
    () => filterCollectionByQuery(collection, query),
    [collection, query],
  );

  const { sortedCollection, collectionGroups } = useCollectionFilter(
    searchedCollection,
    sortBy,
    filters,
    locale,
  );

  const availableMoods = useMemo(
    () => getAvailableMoods(collection, translateMood),
    [collection, translateMood],
  );

  const orderedPending = useMemo(() => sortListenLater(pending), [pending]);

  const filteredPending = useMemo(
    () => filterListenLaterByQuery(orderedPending, query),
    [orderedPending, query],
  );

  const stats = useMemo(
    () => ({
      total: collection.length,
      artists: countCollectionArtists(collection),
      moods: countCollectionMoods(collection),
    }),
    [collection],
  );

  const insights = useMemo(
    () => getCollectionInsights(collection),
    [collection],
  );

  const pendingStats = useMemo(
    () => ({
      total: pending.length,
      artists: countDistinctArtists(pending),
    }),
    [pending],
  );

  const hasFilters = hasCollectionFilters(query, filters);
  const activeFilterCount = countActiveFilters(filters);
  const sortLabelKey = sortBy ? sortKeyToI18nKey(sortBy) : "";

  const availableTags = useMemo(
    () => getAvailableTags(collection),
    [collection],
  );

  const clearFilters = useCallback(() => {
    setQuery("");
    setFilters(emptyFilters);
  }, []);

  const reviewIncomplete = useCallback(() => {
    setQuery("");
    setFilters({ ...emptyFilters, incompleteOnly: true });
  }, []);

  const dismissIncompleteNotice = useCallback(() => {
    setNoticeDismissed(true);
  }, []);

  const removeGroupBy = useCallback(() => {
    setFilters((current) => ({ ...current, groupBy: "none" }));
  }, []);

  const clearIncomplete = useCallback(() => {
    setFilters((current) => ({ ...current, incompleteOnly: false }));
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
    collection,
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
    view,
    setView,
    groupBy: filters.groupBy,
    sortedCollection,
    collectionGroups,
    filteredPending,
    stats,
    pendingStats,
    insights,
    noticeDismissed,
    dismissIncompleteNotice,
    reviewIncomplete,
    removeGroupBy,
    clearIncomplete,
    availableMoods,
    orderedPending,
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
