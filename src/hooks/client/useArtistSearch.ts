import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getUserArtists,
  searchArtists,
  toggleArtistFavorite,
} from "@/services/client/artists";
import type { ArtistLite } from "@/types/artists";

export function useArtistSearch() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<ArtistLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [favorites, setFavorites] = useState<ArtistLite[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      setFavoritesLoaded(true);
      return;
    }

    setFavoritesLoaded(false);
    getUserArtists()
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setFavoritesLoaded(true));
  }, [user?.uid]);

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (!term) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setSearching(true);
    setError(null);

    searchArtists(term)
      .then((items) => {
        if (!cancelled) setResults(items);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, reloadToken]);

  const toggleFavorite = useCallback(
    async (artist: ArtistLite) => {
      if (!user) return;
      try {
        const nowFavorite = await toggleArtistFavorite(artist);
        setFavorites((current) =>
          nowFavorite
            ? [artist, ...current.filter((item) => item.id !== artist.id)]
            : current.filter((item) => item.id !== artist.id),
        );
      } catch {
        // Silencioso: no bloquea la exploración si falla el guardado.
      }
    },
    [user],
  );

  return {
    query,
    setQuery,
    hasQuery: query.trim().length > 0,
    results,
    searching,
    error,
    favorites,
    favoritesLoaded,
    toggleFavorite,
    reload: useCallback(() => setReloadToken((value) => value + 1), []),
  };
}
