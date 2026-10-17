/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

type ArtistBackdropProps = {
  artistId?: string;
  artistName?: string;
};

export default function ArtistBackdrop({
  artistId,
  artistName,
}: ArtistBackdropProps) {
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    let cancelled = false;
    fetch(`/api/getArtist?id=${encodeURIComponent(artistId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((artist) => {
        if (!cancelled) setImage(artist?.images?.[0]?.url || null);
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });

    return () => {
      cancelled = true;
    };
  }, [artistId]);

  return image ? (
    <img
      src={image}
      alt={`Imagen de ${artistName || "artista"}`}
      className="album-art-modal-artist-image"
    />
  ) : (
    <div className="album-art-modal-artist-fallback" aria-hidden="true">
      <span>{artistName?.slice(0, 1).toUpperCase() || "A"}</span>
    </div>
  );
}
