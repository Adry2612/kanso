/* eslint-disable @next/next/no-img-element */
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { getAlbum } from "../../../../services/spotify";
import { openSpotify } from "@/lib/spotifyUtils";
import { FaSpotify } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import AlbumTracklist from "@/components/AlbumTracklist";
import { useTranslations } from "@/context/I18nContext";
import { FastAverageColor } from "fast-average-color";
import { Trash2Icon } from "lucide-react";
import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import { useAuth } from "@/context/AuthContext";
import { undoFavorite } from "@/lib/api/favorites";
import { getMood, normalizeMoods } from "@/constants/moods";
import { FavoriteFormat } from "@/types/favorites";
import type { Album } from "../../../../models/album";
import TagList from "@/components/TagList";
import { useTransitionRouter } from "next-view-transitions";
import { EASE_OUT, motion, useReducedMotion } from "@/components/motion";

type TrackArtist = {
  name: string;
  id: string;
};

type Track = {
  name: string;
  track_number: number;
  artists: TrackArtist[];
};

type SpotifyAlbum = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string; id: string }[];
  external_urls: { spotify: string };
  tracks?: {
    items: {
      name: string;
      track_number: number;
      artists: { name: string; id: string }[];
    }[];
  };
};

export default function AlbumDetail() {
  const t = useTranslations("album");
  const tCommon = useTranslations("common");
  const tModal = useTranslations("modal");
  const params = useParams();
  const albumId = params.albumId as string;
  const router = useTransitionRouter();
  const reduceMotion = useReducedMotion();
  const [albumTracklist, setAlbumTracklist] = useState<Track[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [bgColor, setBgColor] = useState("rgba(6, 78, 59, 0.8)"); // emerald-950 por defecto con opacidad
  const imgRef = useRef<HTMLImageElement>(null);
  const { user } = useAuth();
  const [favorite, setFavorite] = useState<any>(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");

  const {
    data: album,
    error,
    isLoading,
  } = useSuspenseQuery<SpotifyAlbum>({
    queryKey: ["album", albumId],
    queryFn: () => getAlbum(albumId),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !album || !imgRef.current) return;

    const fac = new FastAverageColor();

    fac
      .getColorAsync(imgRef.current, { algorithm: "dominant" })
      .then((color) => {
        // Usar el color con más intensidad
        const rgb = color.value;
        const r = Math.floor(rgb[0] * 0.6);
        const g = Math.floor(rgb[1] * 0.6);
        const b = Math.floor(rgb[2] * 0.6);

        setBgColor(`rgba(${r}, ${g}, ${b}, 0.8)`);
      })
      .catch((e) => {
        console.error("Error extracting color:", e);
      });

    return () => {
      fac.destroy();
    };
  }, [album, mounted]);

  useEffect(() => {
    if (!user?.uid || !albumId) {
      setFavorite(null);
      setCollectionLoading(false);
      return;
    }

    setCollectionLoading(true);
    fetch(`/api/userFavorites?userId=${encodeURIComponent(user.uid)}`)
      .then((response) => (response.ok ? response.json() : { favorites: [] }))
      .then((data) => {
        setFavorite(
          (data.favorites || []).find(
            (item: any) => (item.album?.id || item.albumId) === albumId,
          ) || null,
        );
      })
      .catch(() => setFavorite(null))
      .finally(() => setCollectionLoading(false));
  }, [albumId, user?.uid]);

  useEffect(() => {
    if (!mounted || !album) return;

    if (album.tracks && album.tracks.items) {
      const formattedTracks = album.tracks.items.map((item) => ({
        name: item.name,
        track_number: item.track_number,
        artists: item.artists.map((artist) => ({
          name: artist.name,
          id: artist.id,
        })),
      }));
      setAlbumTracklist(formattedTracks);
    } else {
      setAlbumTracklist([]);
    }
  }, [album, mounted]);

  if (isLoading || !mounted)
    return <div className="text-white">{tCommon("loading")}</div>;
  if (error) return <div className="text-red-500">{t("error")}</div>;
  if (!album) return null;

  const savedMoods = normalizeMoods(favorite?.labeledFeelings || []);
  const savedFormats: FavoriteFormat[] = Array.isArray(favorite?.format)
    ? favorite.format
    : favorite?.format
      ? [favorite.format]
      : [];
  const removeFromCollection = async () => {
    if (!user?.uid) return;
    setRemoving(true);
    try {
      await undoFavorite(album as Album, user.uid);
      setFavorite(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <main className="collectify-main relative min-h-screen overflow-hidden">
      {/* Gradiente de fondo basado en los colores del álbum - desde abajo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${bgColor} 0%, transparent 60%)`,
        }}
      ></div>

      <div className="relative pt-12 md:pt-16">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs text-[#9be7a5] transition hover:text-white"
        >
          ← Volver
        </button>
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="grid w-full items-start gap-8 border-b border-emerald-100/10 pb-10 md:grid-cols-[320px_1fr] md:gap-16"
        >
          <div className="flex w-full flex-col items-start">
            <img
              ref={imgRef}
              src={album.images[0]?.url}
              alt={album.name}
              style={{ viewTransitionName: `album-cover-${album.id}` }}
              className="aspect-square w-full max-w-[320px] rounded-[var(--radius-md)] object-cover shadow-2xl"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex min-w-0 flex-col pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9be7a5]">
              Álbum seleccionado
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-white md:text-7xl">
              {album.name}
            </h1>
            <h2 className="mt-4 text-base text-[#9be7a5]">
              {album.artists[0].name}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#8f9f93]">
              Un disco para volver a escuchar con calma. Explora su lista de
              canciones y guárdalo en tu colección.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button
                onClick={() => openSpotify(album.external_urls.spotify)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#9be7a5] px-4 py-3 text-sm font-semibold text-[#102117] transition hover:bg-[#d6f28d]"
              >
                <FaSpotify />
                {tModal("listenOnSpotify")}
              </button>
              {!collectionLoading &&
                (favorite ? (
                  <>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200/15 px-4 py-3 text-sm text-[#b4c2b6] transition hover:border-[#9be7a5] hover:text-white"
                    >
                      <MdEdit /> Editar colección
                    </button>
                    <button
                      onClick={removeFromCollection}
                      disabled={removing}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#ff9f76]/40 px-4 py-3 text-sm text-[#ffb292] transition hover:bg-[#ff9f76]/10 disabled:opacity-60"
                    >
                      <Trash2Icon size={17} />
                      {removing ? "Eliminando..." : "Eliminar de la colección"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200/15 px-4 py-3 text-sm text-[#b4c2b6] transition hover:border-[#9be7a5] hover:text-white"
                  >
                    <MdEdit /> Añadir a la colección
                  </button>
                ))}
            </div>
            {favorite && (
              <div className="mt-7 grid gap-5 border-t grid-cols-[3fr_2fr] border-emerald-100/10 pt-5">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#8f9f93]">
                    Emociones
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedMoods.length ? (
                      savedMoods.map((mood) => {
                        const item = getMood(mood);
                        return (
                          <span
                            key={mood}
                            className="rounded-full bg-[#9be7a5]/10 px-3 py-1.5 text-xs text-[#9be7a5]"
                          >
                            {item?.symbol} {tMoods(mood)}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-[#8f9f93]">
                        Sin emociones asociadas
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#8f9f93]">
                    Formato
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {savedFormats.map((format) => (
                      <span
                        key={format}
                        className="rounded-full bg-emerald-100/10 px-3 py-1.5 text-xs text-[#d6e5d8]"
                      >
                        {format === "vinyl"
                          ? "Vinilo"
                          : format === "cassette"
                            ? "Cassette"
                            : format === "cd"
                              ? "CD"
                              : "Digital"}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#8f9f93]">
                    Actividades
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {favorite.activities?.length ? (
                      favorite.activities.map((activity: string) => (
                        <span
                          key={activity}
                          className="rounded-full bg-emerald-100/10 px-3 py-1.5 text-xs text-[#d6e5d8]"
                        >
                          {tActivities(activity)}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#8f9f93]">
                        Sin actividades asociadas
                      </span>
                    )}
                  </div>
                </div>
                {favorite.tags?.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#8f9f93]">
                      Etiquetas
                    </p>
                    <TagList tags={favorite.tags} />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.section>
        <AlbumTracklist tracks={albumTracklist} loading={!mounted} />
      </div>
      {modalOpen && (
        <SelectedAlbumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          album={album as Album}
          isFavorite={Boolean(favorite)}
          favoriteData={favorite}
          startEditing={Boolean(favorite)}
          onSaved={(savedFavorite) =>
            setFavorite((current: any) => ({ ...current, ...savedFavorite }))
          }
        />
      )}
    </main>
  );
}
