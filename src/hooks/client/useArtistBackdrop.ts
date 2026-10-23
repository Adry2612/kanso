import { useEffect, useState } from "react";
import { getArtistInfo } from "@/services/client/artists";

export function useArtistBackdrop(artistId?: string) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    let cancelled = false;
    getArtistInfo(artistId)
      .then((artist) => {
        if (!cancelled) setImage(artist?.images?.[0]?.url ?? null);
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [artistId]);

  return image;
}
