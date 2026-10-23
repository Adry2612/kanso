/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import { FaSpotify } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Trash2Icon } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import AlbumTracklist from "@/components/AlbumTracklist";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";
import TagList from "@/components/TagList";
import { AlbumDetailSkeleton } from "@/components/ContentSkeletons";
import { EASE_OUT, motion, useReducedMotion } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import { useAlbumDetail } from "@/hooks/client/useAlbumDetail";
import { getActivity } from "@/constants/activities";
import { getMood } from "@/constants/moods";
import { openSpotify } from "@/lib/spotifyUtils";
import type { Album } from "@/types/album";
import type { FavoriteFormat } from "@/types/favorites";

export default function AlbumDetail() {
  const t = useTranslations("album");
  const tCommon = useTranslations("common");
  const tModal = useTranslations("modal");
  const params = useParams();
  const albumId = params.albumId as string;
  const router = useTransitionRouter();
  const reduceMotion = useReducedMotion();
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tTags = useTranslations("tags");
  const {
    album,
    error,
    isLoading,
    mounted,
    bgColor,
    imgRef,
    albumTracklist,
    favorite,
    pending,
    collectionLoading,
    modalOpen,
    setModalOpen,
    removing,
    removingPending,
    removeFromCollection,
    removeFromPending,
    savedMoods,
    savedFormats,
    onSaved,
    onPendingSaved,
    onPendingRemoved,
  } = useAlbumDetail(albumId);

  if (isLoading || !mounted) {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">{tCommon("loading")}</span>
        <AlbumDetailSkeleton />
      </div>
    );
  }
  if (error) {
    return (
      <main className="kanso-main min-h-screen">
        <ErrorState
          variant="page"
          title={t("error")}
          description={t("errorDescription")}
          onRetry={() => window.location.reload()}
        />
      </main>
    );
  }
  if (!album) return null;

  const formatLabel = (format: FavoriteFormat) => {
    const keys: Record<FavoriteFormat, string> = {
      digital: "formatDigital",
      vinyl: "formatVinyl",
      cd: "formatCd",
      cassette: "formatCassette",
    };
    return t(keys[format]);
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
                ) : pending ? (
                  <>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
                    >
                      {tModal("moveToCollection")}
                    </button>
                    <button
                      onClick={removeFromPending}
                      disabled={removingPending}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--kanso-danger)]/40 px-4 py-3 text-sm text-[var(--kanso-danger)] transition hover:bg-[var(--kanso-danger)]/10 disabled:opacity-60"
                    >
                      <Trash2Icon size={17} />
                      {removingPending
                        ? tModal("removing")
                        : tModal("removeFromPending")}
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
          </div>
        </motion.section>
        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-12">
          <AlbumTracklist
            tracks={albumTracklist}
            loading={!mounted || albumTracklist === null}
            className="max-w-none"
          />
          {favorite && (
            <aside
              aria-labelledby="album-record-title"
              className="order-first xl:order-none xl:sticky xl:top-8"
            >
              <p
                id="album-record-title"
                className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-muted)]"
              >
                {t("myRecord")}
              </p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                {savedMoods.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                      {t("emotions")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedMoods.map((mood) => {
                        const item = getMood(mood);
                        return (
                          <span
                            key={mood}
                            className="rounded-full bg-[var(--kanso-mint)]/10 px-3 py-1.5 text-xs text-[var(--kanso-mint)]"
                          >
                            <InlineEmoji emoji={item?.emoji} />
                            {tMoods(mood)}
                          </span>
                        );
                      })}
                    </div>
                  </section>
                )}

                {!!favorite.activities?.length && (
                  <section>
                    <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                      {t("activities")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(favorite.activities ?? []).map((activity: string) => (
                        <span
                          key={activity}
                          className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                        >
                          <InlineEmoji emoji={getActivity(activity)?.emoji} />
                          {tActivities(activity)}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {savedFormats.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                      {t("format")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedFormats.map((format) => (
                        <span
                          key={format}
                          className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                        >
                          {formatLabel(format)}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {!!favorite.tags?.length && (
                  <section>
                    <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                      {tTags("title")}
                    </p>
                    <TagList tags={favorite.tags} showCategory />
                  </section>
                )}

                {!savedMoods.length &&
                  !favorite.activities?.length &&
                  !savedFormats.length &&
                  !favorite.tags?.length && (
                    <p className="text-xs text-[var(--kanso-muted)]">
                      {t("recordSummaryEmpty")}
                    </p>
                  )}
              </div>
            </aside>
          )}
          {pending && !favorite && (
            <aside
              aria-labelledby="album-pending-title"
              className="order-first xl:order-none xl:sticky xl:top-8"
            >
              <p
                id="album-pending-title"
                className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-muted)]"
              >
                {tModal("pendingBadge")}
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--kanso-muted)]">
                {tModal("pendingDescription")}
              </p>
            </aside>
          )}
        </div>
      </div>
      {modalOpen && (
        <SelectedAlbumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          album={album as Album}
          isFavorite={Boolean(favorite)}
          isPending={Boolean(pending) && !favorite}
          pendingData={pending}
          favoriteData={favorite}
          startEditing={Boolean(favorite)}
          startMovingToCollection={Boolean(pending) && !favorite}
          onSaved={onSaved}
          onPendingSaved={onPendingSaved}
          onPendingRemoved={onPendingRemoved}
        />
      )}
    </main>
  );
}
