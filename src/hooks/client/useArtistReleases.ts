import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getArtistReleases } from "@/services/client/artists";
import { groupReleasesByMonth } from "@/utils/releases";
import type { ArtistRelease } from "@/types/artists";

export function useArtistReleases() {
  const { user } = useAuth();
  const [releases, setReleases] = useState<ArtistRelease[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setReleases([]);
      return;
    }

    let cancelled = false;
    setReleases(null);
    setError(null);

    getArtistReleases()
      .then((items) => {
        if (!cancelled) setReleases(items);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setReleases([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, reloadToken]);

  const groups = groupReleasesByMonth(releases ?? []);

  return {
    releases,
    groups,
    error,
    reload: useCallback(() => setReloadToken((value) => value + 1), []),
  };
}
