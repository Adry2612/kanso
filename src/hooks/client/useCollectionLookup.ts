import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCollection } from "@/services/client/collection";
import { getListenLater } from "@/services/client/listenLater";
import type { CollectionAlbum, ListenLaterItem } from "@/types/collection";

export function useCollectionLookup() {
  const { user } = useAuth();
  const [collectionByAlbum, setCollectionByAlbum] = useState<
    Map<string, CollectionAlbum>
  >(new Map());
  const [pendingByAlbum, setPendingByAlbum] = useState<
    Map<string, ListenLaterItem>
  >(new Map());
  const [collectionLoaded, setCollectionLoaded] = useState(false);
  const [collectionError, setCollectionError] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setCollectionByAlbum(new Map());
      setPendingByAlbum(new Map());
      setCollectionLoaded(true);
      return;
    }

    let cancelled = false;
    setCollectionLoaded(false);
    setCollectionError(false);

    getCollection()
      .then((collection) => {
        if (cancelled) return;
        const map = new Map<string, CollectionAlbum>();
        collection.forEach((entry) => {
          const albumId = entry.album?.id ?? entry.albumId;
          if (albumId) map.set(albumId, entry);
        });
        setCollectionByAlbum(map);
        setCollectionLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setCollectionByAlbum(new Map());
        setCollectionError(true);
        setCollectionLoaded(true);
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

  const setCollectionEntry = useCallback(
    (albumId: string, entry: CollectionAlbum) => {
      setCollectionByAlbum((current) => {
        const next = new Map(current);
        next.set(albumId, entry);
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
      setCollectionByAlbum((current) => {
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
    collectionByAlbum,
    pendingByAlbum,
    collectionLoaded,
    collectionError,
    setCollectionEntry,
    setPending,
    removePending,
  };
}
