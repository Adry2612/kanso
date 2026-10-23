import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { useAuth } from "@/context/AuthContext";
import { getAlbum } from "@/services/client/albums";
import { getCollection, removeFavorite } from "@/services/client/favorites";
import {
  getListenLater,
  removeFromListenLater,
} from "@/services/client/listenLater";
import { normalizeMoods } from "@/constants/moods";
import { deriveBackdropColor } from "@/utils/color";
import { normalizeFavoriteFormats } from "@/utils/formats";
import { toTracklist } from "@/utils/tracklist";
import type { Album, SpotifyAlbum } from "@/types/album";
import type {
  CollectionFavorite,
  FavoriteFormat,
  ListenLaterItem,
  SaveAlbumResult,
} from "@/types/favorites";

const DEFAULT_BACKGROUND = "rgba(6, 78, 59, 0.8)";

export function useAlbumDetail(albumId: string) {
  const { user } = useAuth();
  const imgRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const [bgColor, setBgColor] = useState(DEFAULT_BACKGROUND);
  const [favorite, setFavorite] = useState<CollectionFavorite | null>(null);
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
    () => normalizeMoods(favorite?.labeledFeelings ?? []),
    [favorite],
  );

  const savedFormats: FavoriteFormat[] = useMemo(
    () => normalizeFavoriteFormats(favorite?.format),
    [favorite],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !album || !imgRef.current) return;

    const fac = new FastAverageColor();

    fac
      .getColorAsync(imgRef.current, { algorithm: "dominant" })
      .then((color) => {
        setBgColor(
          deriveBackdropColor([color.value[0], color.value[1], color.value[2]]),
        );
      })
      .catch(() => {
        setBgColor(DEFAULT_BACKGROUND);
      });

    return () => {
      fac.destroy();
    };
  }, [album, mounted]);

  useEffect(() => {
    if (!user?.uid || !albumId) {
      setFavorite(null);
      setPending(null);
      setCollectionLoading(false);
      return;
    }

    setCollectionLoading(true);
    const loadCollectionState = async () => {
      try {
        const [favorites, pendingAlbums] = await Promise.all([
          getCollection(),
          getListenLater().catch(() => []),
        ]);

        setFavorite(
          favorites.find(
            (item) => (item.album?.id ?? item.albumId) === albumId,
          ) ?? null,
        );
        setPending(
          pendingAlbums.find(
            (item) => (item.album?.id ?? item.albumId) === albumId,
          ) ?? null,
        );
      } catch {
        setFavorite(null);
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
      await removeFavorite(album);
      setFavorite(null);
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
    setFavorite((current) => ({
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
    bgColor,
    imgRef,
    albumTracklist,
    favorite,
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
