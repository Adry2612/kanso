import { useCallback, useEffect, useState } from "react";
import { getCommunityAlbums } from "@/services/client/community";
import type { CommunityAlbum } from "@/types/community";

export function useLandingAlbums(limit = 3) {
  const [albums, setAlbums] = useState<CommunityAlbum[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setAlbums(null);
    setError(false);

    try {
      const items = await getCommunityAlbums();
      setAlbums(items.slice(0, limit));
    } catch {
      setAlbums([]);
      setError(true);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { albums, error, reload: load };
}
