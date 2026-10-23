"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFriendLibrary } from "@/services/client/friends";
import { groupByDate } from "@/utils/dates";
import {
  getAvailableSharedSections,
  getDisplayableRecommendations,
  getFirstSharedSectionWithItems,
  resolveActiveSharedSection,
  type SharedSection,
} from "@/utils/friends";
import type { FriendLibraryResponse } from "@/types/friends";

/** Resultados que se muestran antes de pulsar «Ver más». */
const PAGE_SIZE = 10;

type Options = {
  errorMessage: string;
};

/**
 * Carga y navegación de la biblioteca que un amigo comparte: sección activa,
 * paginación local y estados de error/404.
 */
export function useFriendLibrary(uid: string, { errorMessage }: Options) {
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<FriendLibraryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<SharedSection | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const reload = useCallback(async () => {
    if (!uid) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const library = await getFriendLibrary(uid);
      if (!library) {
        setData(null);
        setNotFound(true);
      } else {
        setData(library);
      }
    } catch (loadFailure) {
      setData(null);
      setError(
        loadFailure instanceof Error ? loadFailure.message : errorMessage,
      );
    } finally {
      setLoading(false);
    }
  }, [errorMessage, uid]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.isAnonymous) {
      setLoading(false);
      setData(null);
      return;
    }

    void reload();
  }, [authLoading, user, reload]);

  const recommendationItems = useMemo(
    () => getDisplayableRecommendations(data?.recommendations),
    [data?.recommendations],
  );

  const recommendationGroups = useMemo(
    () => groupByDate(recommendationItems.slice(0, visibleCount)),
    [recommendationItems, visibleCount],
  );

  const availableSections = useMemo<SharedSection[]>(
    () => (data ? getAvailableSharedSections(data) : []),
    [data],
  );

  const firstSectionWithItems = useMemo(
    () =>
      data
        ? getFirstSharedSectionWithItems(data, recommendationItems.length)
        : null,
    [data, recommendationItems.length],
  );

  const activeSection = resolveActiveSharedSection(
    selectedSection,
    availableSections,
    firstSectionWithItems,
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeSection]);

  const selectSection = useCallback((section: SharedSection) => {
    setSelectedSection(section);
  }, []);

  const showMore = useCallback(() => {
    setVisibleCount((count) => count + PAGE_SIZE);
  }, []);

  const totalRecommendations = recommendationItems.length;
  const totalCollection = data?.collection?.length ?? 0;
  const totalArtists = data?.artists?.length ?? 0;
  const activeTotal =
    activeSection === "recommendations"
      ? totalRecommendations
      : activeSection === "collection"
        ? totalCollection
        : totalArtists;
  const canShowMore = activeSection !== null && activeTotal > visibleCount;

  return {
    data,
    loading,
    notFound,
    error,
    recommendationItems,
    recommendationGroups,
    availableSections,
    activeSection,
    activeTotal,
    canShowMore,
    visibleCount,
    totalRecommendations,
    totalCollection,
    totalArtists,
    reload,
    selectSection,
    showMore,
  };
}
