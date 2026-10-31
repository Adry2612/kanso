import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAlbum } from "@/services/client/albums";
import {
  getCollection,
  removeCollectionAlbum,
} from "@/services/client/collection";
import {
  getListenLater,
  removeFromListenLater,
} from "@/services/client/listenLater";
import { normalizeMoods } from "@/constants/moods";
import { normalizeCollectionFormats } from "@/utils/formats";
import { toTracklist } from "@/utils/tracklist";
import type { Album, SpotifyAlbum } from "@/types/album";
import type {
  CollectionAlbum,
  CollectionFormat,
  ListenLaterItem,
  SaveAlbumResult,
} from "@/types/collection";

export function useAlbumDetail(albumId: string) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [collectionEntry, setCollectionEntry] =
    useState<CollectionAlbum | null>(null);
  const [pending, setPending] = useState<ListenLaterItem | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removingPending, setRemovingPending] = useState(false);

  const {
    data: album,
    error,
    isLoading,
  } = useSuspenseQuery<SpotifyAlbum>({
    queryKey: ["album", albumId],
    queryFn: () => getAlbum(albumId),
  });

  const albumTracklist = useMemo(
    () => (album ? toTracklist(album.tracks?.items) : null),
    [album],
  );

  const savedMoods = useMemo(
    () => normalizeMoods(collectionEntry?.labeledFeelings ?? []),
    [collectionEntry],
  );

  const savedFormats: CollectionFormat[] = useMemo(
    () => normalizeCollectionFormats(collectionEntry?.format),
    [collectionEntry],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.uid || !albumId) {
      setCollectionEntry(null);
      setPending(null);
      setCollectionLoading(false);
      return;
    }

    setCollectionLoading(true);
    const loadCollectionState = async () => {
      try {
        const [collection, pendingAlbums] = await Promise.all([
          getCollection(),
          getListenLater().catch(() => []),
        ]);

        setCollectionEntry(
          collection.find(
            (item) => (item.album?.id ?? item.albumId) === albumId,
          ) ?? null,
        );
        setPending(
          pendingAlbums.find(
            (item) => (item.album?.id ?? item.albumId) === albumId,
          ) ?? null,
        );
      } catch {
        setCollectionEntry(null);
        setPending(null);
      } finally {
        setCollectionLoading(false);
      }
    };

    loadCollectionState();
  }, [albumId, user?.uid]);

  const removeFromCollection = async () => {
    if (!user?.uid || !album) return;
    setRemoving(true);
    try {
      await removeCollectionAlbum(album);
      setCollectionEntry(null);
    } finally {
      setRemoving(false);
    }
  };

  const removeFromPending = async () => {
    if (!user?.uid || !album) return;
    setRemovingPending(true);
    try {
      await removeFromListenLater(album);
      setPending(null);
    } finally {
      setRemovingPending(false);
    }
  };

  const onSaved = (saved: SaveAlbumResult) => {
    if (!album) return;
    setCollectionEntry((current) => ({
      id: current?.id ?? saved.albumId,
      album: album as Album,
      savedAt: new Date().toISOString(),
      labeledFeelings: saved.feelings,
      activities: saved.activities,
      format: saved.format,
      tags: saved.tags,
      userId: user?.uid ?? current?.userId ?? "",
      ...current,
    }));
    setPending(null);
  };

  return {
    album,
    error,
    isLoading,
    mounted,
    albumTracklist,
    collectionEntry,
    pending,
    collectionLoading,
    modalOpen,
    setModalOpen,
    removing,
    removingPending,
    removeFromCollection,
    removeFromPending,
    savedMoods,
    savedFormats,
    onSaved,
    onPendingSaved: setPending,
    onPendingRemoved: () => setPending(null),
  };
}
