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
import { ChevronDown, Trash2Icon } from "lucide-react";
import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import { useAuth } from "@/context/AuthContext";
import { undoFavorite } from "@/lib/api/favorites";
import { authFetch } from "@/lib/api/authFetch";
import { getMood, normalizeMoods } from "@/constants/moods";
import { FavoriteFormat } from "@/types/favorites";
import type { Album } from "../../../../models/album";
import TagList, { type Tag } from "@/components/TagList";

type FavoriteRecord = {
  labeledFeelings?: string[];
  format?: FavoriteFormat | FavoriteFormat[];
  activities?: string[];
  tags?: Tag[];
};
import { useTransitionRouter } from "next-view-transitions";
import {
  AnimatePresence,
  EASE_OUT,
  motion,
  useReducedMotion,
} from "@/components/motion";

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
  const [favorite, setFavorite] = useState<FavoriteRecord | null>(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tTags = useTranslations("tags");

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
    authFetch("/api/userFavorites")
      .then((response) => (response.ok ? response.json() : { favorites: [] }))
      .then((data) => {
        setFavorite(
          (data.favorites || []).find(
            (item: { album?: { id?: string }; albumId?: string }) =>
              (item.album?.id || item.albumId) === albumId,
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
    return <div className="text-[var(--foreground)]">{tCommon("loading")}</div>;
  if (error) return <div className="text-red-500">{t("error")}</div>;
  if (!album) return null;

  const savedMoods = normalizeMoods(favorite?.labeledFeelings || []);
  const favoriteFormat = favorite?.format;
  const savedFormats: FavoriteFormat[] = Array.isArray(favoriteFormat)
    ? favoriteFormat
    : favoriteFormat
      ? [favoriteFormat]
      : [];
  const formatLabel = (format: FavoriteFormat) => {
    const keys: Record<FavoriteFormat, string> = {
      digital: "formatDigital",
      vinyl: "formatVinyl",
      cd: "formatCd",
      cassette: "formatCassette",
    };
    return t(keys[format]);
  };
  const recordSummary = [
    ...savedMoods
      .slice(0, 2)
      .map((mood) => `${getMood(mood)?.symbol ?? ""} ${tMoods(mood)}`.trim()),
    ...(favorite?.activities ?? [])
      .slice(0, 2)
      .map((activity) => tActivities(activity)),
    ...savedFormats.map((format) => formatLabel(format)),
    ...(favorite?.tags ?? []).slice(0, 2).map((tag) => tag.value),
  ].join(" · ");
  const removeFromCollection = async () => {
    if (!user?.uid) return;
    setRemoving(true);
    try {
      await undoFavorite(album as Album);
      setFavorite(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <main className="kanso-main relative min-h-screen overflow-hidden">
      {/* Gradiente de fondo basado en los colores del álbum - desde abajo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${bgColor} 0%, transparent 60%)`,
        }}
      ></div>

      <div className="relative pt-5 md:pt-16">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs text-[var(--kanso-mint)] transition hover:text-[var(--foreground)]"
        >
          ← Volver
        </button>
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="grid w-full items-start gap-8 border-b border-[var(--kanso-line)] pb-10 md:grid-cols-[320px_1fr] md:gap-16"
        >
          <div className="flex w-full flex-col items-center md:items-start">
            <img
              fetchPriority="high"
              decoding="async"
              ref={imgRef}
              src={album.images[0]?.url}
              alt={album.name}
              style={{ viewTransitionName: `album-cover-${album.id}` }}
              className="aspect-square w-full max-w-[320px] rounded-[var(--radius-md)] object-cover shadow-2xl"
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex min-w-0 flex-col pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              Álbum seleccionado
            </p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight text-[var(--foreground)] md:text-7xl">
              {album.name}
            </h1>
            <h2 className="mt-4 text-base text-[var(--kanso-mint)]">
              {album.artists[0].name}
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
              Un disco para volver a escuchar con calma. Explora su lista de
              canciones y guárdalo en tu colección.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button
                onClick={() => openSpotify(album.external_urls.spotify)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
              >
                <FaSpotify />
                {tModal("listenOnSpotify")}
              </button>
              {!collectionLoading &&
                (favorite ? (
                  <>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)] hover:text-[var(--foreground)]"
                    >
                      <MdEdit /> Editar colección
                    </button>
                    <button
                      onClick={removeFromCollection}
                      disabled={removing}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-danger)]/40 px-4 py-3 text-sm text-[var(--kanso-danger)] transition hover:bg-[var(--kanso-danger)]/10 disabled:opacity-60"
                    >
                      <Trash2Icon size={17} />
                      {removing ? "Eliminando..." : "Eliminar de la colección"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)] hover:text-[var(--foreground)]"
                  >
                    <MdEdit /> Añadir a la colección
                  </button>
                ))}
            </div>
            {favorite && (
              <div className="mt-7 border-t border-[var(--kanso-line)]">
                <button
                  type="button"
                  id="album-record-toggle"
                  aria-expanded={recordOpen}
                  aria-controls="album-record"
                  onClick={() => setRecordOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-muted)]">
                      {t("myRecord")}
                    </span>
                    <span className="mt-1 block truncate text-xs text-[var(--kanso-muted)]">
                      {recordSummary || t("recordSummaryEmpty")}
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 text-[var(--kanso-muted)] transition-transform duration-200 ${
                      recordOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {recordOpen && (
                    <motion.div
                      id="album-record"
                      role="region"
                      aria-labelledby="album-record-toggle"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.24,
                        ease: EASE_OUT,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 gap-x-10 gap-y-5 pb-5 pt-1 sm:grid-cols-2">
                        <section>
                          <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                            {t("emotions")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {savedMoods.length ? (
                              savedMoods.map((mood) => {
                                const item = getMood(mood);
                                return (
                                  <span
                                    key={mood}
                                    className="rounded-full bg-[var(--kanso-mint)]/10 px-3 py-1.5 text-xs text-[var(--kanso-mint)]"
                                  >
                                    {item?.symbol} {tMoods(mood)}
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-xs text-[var(--kanso-muted)]">
                                {t("noEmotions")}
                              </span>
                            )}
                          </div>
                        </section>

                        <section>
                          <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                            {t("activities")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {favorite.activities?.length ? (
                              favorite.activities.map((activity: string) => (
                                <span
                                  key={activity}
                                  className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                                >
                                  {tActivities(activity)}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[var(--kanso-muted)]">
                                {t("noActivities")}
                              </span>
                            )}
                          </div>
                        </section>

                        <section>
                          <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                            {t("format")}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {savedFormats.length ? (
                              savedFormats.map((format) => (
                                <span
                                  key={format}
                                  className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                                >
                                  {formatLabel(format)}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[var(--kanso-muted)]">
                                {t("noFormat")}
                              </span>
                            )}
                          </div>
                        </section>

                        <section>
                          <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                            {tTags("title")}
                          </p>
                          {favorite.tags?.length ? (
                            <TagList tags={favorite.tags} showCategory />
                          ) : (
                            <span className="text-xs text-[var(--kanso-muted)]">
                              {t("noTags")}
                            </span>
                          )}
                        </section>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
            setFavorite((current) => ({ ...current, ...savedFavorite }))
          }
        />
      )}
    </main>
  );
}
