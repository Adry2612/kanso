import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCollection } from "@/services/client/favorites";
import { getListenLater } from "@/services/client/listenLater";
import type { CollectionFavorite, ListenLaterItem } from "@/types/favorites";

export function useCollectionLookup() {
  const { user } = useAuth();
  const [favoritesByAlbum, setFavoritesByAlbum] = useState<
    Map<string, CollectionFavorite>
  >(new Map());
  const [pendingByAlbum, setPendingByAlbum] = useState<
    Map<string, ListenLaterItem>
  >(new Map());
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [favoritesError, setFavoritesError] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setFavoritesByAlbum(new Map());
      setPendingByAlbum(new Map());
      setFavoritesLoaded(true);
      return;
    }

    let cancelled = false;
    setFavoritesLoaded(false);
    setFavoritesError(false);

    getCollection()
      .then((favorites) => {
        if (cancelled) return;
        const map = new Map<string, CollectionFavorite>();
        favorites.forEach((favorite) => {
          const albumId = favorite.album?.id ?? favorite.albumId;
          if (albumId) map.set(albumId, favorite);
        });
        setFavoritesByAlbum(map);
        setFavoritesLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setFavoritesByAlbum(new Map());
        setFavoritesError(true);
        setFavoritesLoaded(true);
      });

    getListenLater()
      .then((albums) => {
        if (cancelled) return;
        const map = new Map<string, ListenLaterItem>();
        albums.forEach((pendingAlbum) => {
          const albumId = pendingAlbum.album?.id ?? pendingAlbum.albumId;
          if (albumId) map.set(albumId, pendingAlbum);
        });
        setPendingByAlbum(map);
      })
      .catch(() => {
        if (!cancelled) setPendingByAlbum(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const setFavorite = useCallback(
    (albumId: string, favorite: CollectionFavorite) => {
      setFavoritesByAlbum((current) => {
        const next = new Map(current);
        next.set(albumId, favorite);
        return next;
      });
      setPendingByAlbum((current) => {
        const next = new Map(current);
        next.delete(albumId);
        return next;
      });
    },
    [],
  );

  const setPending = useCallback(
    (albumId: string, pending: ListenLaterItem) => {
      setPendingByAlbum((current) => {
        const next = new Map(current);
        next.set(albumId, pending);
        return next;
      });
      setFavoritesByAlbum((current) => {
        const next = new Map(current);
        next.delete(albumId);
        return next;
      });
    },
    [],
  );

  const removePending = useCallback((albumId: string) => {
    setPendingByAlbum((current) => {
      const next = new Map(current);
      next.delete(albumId);
      return next;
    });
  }, []);

  return {
    favoritesByAlbum,
    pendingByAlbum,
    favoritesLoaded,
    favoritesError,
    setFavorite,
    setPending,
    removePending,
  };
}
