import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlbumSearch } from "@/hooks/client/useAlbumSearch";
import { useCollectionLookup } from "@/hooks/client/useCollectionLookup";
import { useCommunitySuggestions } from "@/hooks/client/useCommunitySuggestions";
import { getAvailableMoods, getAvailableTags } from "@/utils/collection";
import type { Album } from "@/types/album";
import type {
  CollectionAlbum,
  ListenLaterItem,
  SaveAlbumResult,
} from "@/types/collection";

export function useSearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const { debouncedQuery, result, loading, error, retry } =
    useAlbumSearch(query);

  const {
    collectionByAlbum,
    pendingByAlbum,
    collectionLoaded,
    collectionError,
    setCollectionEntry,
    setPending,
    removePending,
  } = useCollectionLookup();

  const { communitySearches, communityAlbums } = useCommunitySuggestions(query);

  useEffect(() => {
    setMounted(true);
  }, []);

  const collection = Array.from(collectionByAlbum.values());
  const collectionMoods = getAvailableMoods(collection).slice(0, 6);
  const collectionTags = getAvailableTags(collection).slice(0, 8);

  const selectedIsInCollection = selectedAlbum
    ? collectionByAlbum.has(selectedAlbum.id)
    : false;
  const selectedIsPending = selectedAlbum
    ? !collectionByAlbum.has(selectedAlbum.id) &&
      pendingByAlbum.has(selectedAlbum.id)
    : false;

  const openAlbumModal = (album: Album) => {
    setOpenModal((previous) => !previous);
    setSelectedAlbum(album);
  };

  const closeAlbumModal = () => setOpenModal(false);

  const handleSaved = (saved: SaveAlbumResult) => {
    if (!selectedAlbum) return;
    const entry: CollectionAlbum = {
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
    setCollectionEntry(selectedAlbum.id, entry);
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
    collectionByAlbum,
    pendingByAlbum,
    collectionLoaded,
    collectionError,
    communitySearches,
    communityAlbums,
    collectionMoods,
    collectionTags,
    openModal,
    selectedAlbum,
    selectedIsInCollection,
    selectedIsPending,
    selectedPendingData: selectedAlbum
      ? (pendingByAlbum.get(selectedAlbum.id) ?? null)
      : null,
    selectedCollectionData: selectedAlbum
      ? collectionByAlbum.get(selectedAlbum.id)
      : undefined,
    openAlbumModal,
    closeAlbumModal,
    handleSaved,
    handlePendingSaved,
    handlePendingRemoved,
  };
}
