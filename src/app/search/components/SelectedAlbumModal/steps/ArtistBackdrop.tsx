/* eslint-disable @next/next/no-img-element */
"use client";

import { useArtistBackdrop } from "@/hooks/client/useArtistBackdrop";
import { getArtistInitial } from "@/utils/artists";

type ArtistBackdropProps = {
  artistId?: string;
  artistName?: string;
};

export default function ArtistBackdrop({
  artistId,
  artistName,
}: ArtistBackdropProps) {
  const image = useArtistBackdrop(artistId);

  return image ? (
    <img
      loading="lazy"
      decoding="async"
      src={image}
      alt={`Imagen de ${artistName || "artista"}`}
      className="album-art-modal-artist-image"
    />
  ) : (
    <div className="album-art-modal-artist-fallback" aria-hidden="true">
      <span>{getArtistInitial(artistName)}</span>
    </div>
  );
}
