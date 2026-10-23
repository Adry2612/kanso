import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlbumSearch } from "@/hooks/client/useAlbumSearch";
import { useCollectionLookup } from "@/hooks/client/useCollectionLookup";
import { useCommunitySuggestions } from "@/hooks/client/useCommunitySuggestions";
import { getAvailableMoods, getAvailableTags } from "@/utils/favorites";
import type { Album } from "@/types/album";
import type {
  CollectionFavorite,
  ListenLaterItem,
  SaveAlbumResult,
} from "@/types/favorites";

export function useSearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const { debouncedQuery, result, loading, error, retry } =
    useAlbumSearch(query);

  const {
    favoritesByAlbum,
    pendingByAlbum,
    favoritesLoaded,
    favoritesError,
    setFavorite,
    setPending,
    removePending,
  } = useCollectionLookup();

  const { communitySearches, communityAlbums } = useCommunitySuggestions(query);

  useEffect(() => {
    setMounted(true);
  }, []);

  const favorites = Array.from(favoritesByAlbum.values());
  const collectionMoods = getAvailableMoods(favorites).slice(0, 6);
  const collectionTags = getAvailableTags(favorites).slice(0, 8);

  const selectedIsFavorite = selectedAlbum
    ? favoritesByAlbum.has(selectedAlbum.id)
    : false;
  const selectedIsPending = selectedAlbum
    ? !favoritesByAlbum.has(selectedAlbum.id) &&
      pendingByAlbum.has(selectedAlbum.id)
    : false;

  const openAlbumModal = (album: Album) => {
    setOpenModal((previous) => !previous);
    setSelectedAlbum(album);
  };

  const closeAlbumModal = () => setOpenModal(false);

  const handleSaved = (saved: SaveAlbumResult) => {
    if (!selectedAlbum) return;
    const favorite: CollectionFavorite = {
      id: saved.albumId,
      albumId: saved.albumId,
      album: selectedAlbum,
      savedAt: saved.addedAt ?? new Date().toISOString(),
      labeledFeelings: saved.feelings,
      activities: saved.activities,
      format: saved.format,
      tags: saved.tags,
      userId: user?.uid ?? "",
    };
    setFavorite(selectedAlbum.id, favorite);
  };

  const handlePendingSaved = (pending: ListenLaterItem | null) => {
    if (!selectedAlbum || !pending) return;
    setPending(selectedAlbum.id, pending);
  };

  const handlePendingRemoved = () => {
    if (!selectedAlbum) return;
    removePending(selectedAlbum.id);
  };

  return {
    query,
    setQuery,
    mounted,
    debouncedQuery,
    result,
    loading,
    error,
    retry,
    favoritesByAlbum,
    pendingByAlbum,
    favoritesLoaded,
    favoritesError,
    communitySearches,
    communityAlbums,
    collectionMoods,
    collectionTags,
    openModal,
    selectedAlbum,
    selectedIsFavorite,
    selectedIsPending,
    selectedPendingData: selectedAlbum
      ? (pendingByAlbum.get(selectedAlbum.id) ?? null)
      : null,
    selectedFavoriteData: selectedAlbum
      ? favoritesByAlbum.get(selectedAlbum.id)
      : undefined,
    openAlbumModal,
    closeAlbumModal,
    handleSaved,
    handlePendingSaved,
    handlePendingRemoved,
  };
}
