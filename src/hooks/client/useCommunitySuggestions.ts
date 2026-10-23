import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCommunityAlbums,
  getCommunitySearches,
  registerCommunitySearch,
} from "@/services/client/community";
import {
  extendsPreviousTerm,
  normalizeCommunityTerm,
} from "@/utils/searchTerms";
import type { CommunityAlbum } from "@/types/community";

export function useCommunityData() {
  const [communitySearches, setCommunitySearches] = useState<string[]>([]);
  const [communityAlbums, setCommunityAlbums] = useState<CommunityAlbum[]>([]);

  useEffect(() => {
    let cancelled = false;

    getCommunitySearches().then((terms) => {
      if (!cancelled) setCommunitySearches(terms);
    });
    getCommunityAlbums().then((albums) => {
      if (!cancelled) setCommunityAlbums(albums);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { communitySearches, communityAlbums };
}

export function useCommunitySuggestions(query: string) {
  const data = useCommunityData();
  const lastRegisteredTerm = useRef<string | null>(null);

  useEffect(() => {
    const term = normalizeCommunityTerm(query);
    if (term.length < 3) return;

    const timer = setTimeout(() => {
      const normalized = term.toLocaleLowerCase("es");
      const previous = lastRegisteredTerm.current;
      if (previous === normalized) return;

      const extendsPrevious = extendsPreviousTerm(previous, normalized);
      lastRegisteredTerm.current = normalized;
      registerCommunitySearch(
        term,
        extendsPrevious && previous ? previous : undefined,
      ).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [query]);

  return data;
}

export function useCommunityRetry() {
  const [reloadToken, setReloadToken] = useState(0);
  return {
    reloadToken,
    retry: useCallback(() => setReloadToken((value) => value + 1), []),
  };
}
