import { useCallback, useEffect, useState } from "react";
import { getArtistAlbums, getArtistInfo } from "@/services/client/artists";
import type { ArtistAlbumLite, ArtistLite } from "@/types/artists";

export function useArtistDetail(artistId: string | undefined) {
  const [artist, setArtist] = useState<ArtistLite | null>(null);
  const [albums, setAlbums] = useState<ArtistAlbumLite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!artistId) return;
    let cancelled = false;
    setAlbums(null);
    setError(null);

    getArtistInfo(artistId)
      .then((data) => {
        if (!cancelled) setArtist(data);
      })
      .catch(() => {});

    getArtistAlbums(artistId)
      .then((data) => {
        if (!cancelled) setAlbums(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [artistId, reloadToken]);

  return {
    artist,
    albums,
    error,
    reload: useCallback(() => setReloadToken((value) => value + 1), []),
  };
}
