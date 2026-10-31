"use client";

import { useParams } from "next/navigation";
import { FaSpotify } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Trash2Icon } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import AlbumShowcase from "@/components/album/AlbumShowcase";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";
import TagList from "@/components/TagList";
import { AlbumDetailSkeleton } from "@/components/ContentSkeletons";
import { useTranslations } from "@/context/I18nContext";
import { useAlbumDetail } from "@/hooks/client/useAlbumDetail";
import { getActivity } from "@/constants/activities";
import { getMood } from "@/constants/moods";
import { openSpotify } from "@/lib/spotifyUtils";
import type { Album } from "@/types/album";
import type { CollectionFormat } from "@/types/collection";

export default function AlbumDetail() {
  const t = useTranslations("album");
  const tCommon = useTranslations("common");
  const tModal = useTranslations("modal");
  const params = useParams();
  const albumId = params.albumId as string;
  const router = useTransitionRouter();
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tTags = useTranslations("tags");
  const {
    album,
    error,
    isLoading,
    mounted,
    albumTracklist,
    collectionEntry,
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

  const formatLabel = (format: CollectionFormat) => {
    const keys: Record<CollectionFormat, string> = {
      digital: "formatDigital",
      vinyl: "formatVinyl",
      cd: "formatCd",
      cassette: "formatCassette",
    };
    return t(keys[format]);
  };

  const actions = (
    <>
      <button
        onClick={() => openSpotify(album.external_urls.spotify)}
        className="flex items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
      >
        <FaSpotify />
        {tModal("listenOnSpotify")}
      </button>
      {!collectionLoading &&
        (collectionEntry ? (
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
    </>
  );

  const aside = collectionEntry ? (
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

        {!!collectionEntry.activities?.length && (
          <section>
            <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
              {t("activities")}
            </p>
            <div className="flex flex-wrap gap-2">
              {(collectionEntry.activities ?? []).map((activity: string) => (
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

        {!!collectionEntry.tags?.length && (
          <section>
            <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
              {tTags("title")}
            </p>
            <TagList tags={collectionEntry.tags} showCategory />
          </section>
        )}

        {!savedMoods.length &&
          !collectionEntry.activities?.length &&
          !savedFormats.length &&
          !collectionEntry.tags?.length && (
            <p className="text-xs text-[var(--kanso-muted)]">
              {t("recordSummaryEmpty")}
            </p>
          )}
      </div>
    </aside>
  ) : pending ? (
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
  ) : undefined;

  return (
    <>
      <AlbumShowcase
        album={album}
        eyebrow="Álbum seleccionado"
        description="Un disco para volver a escuchar con calma. Explora su lista de canciones y guárdalo en tu colección."
        actions={actions}
        onBack={() => router.back()}
        backLabel="Volver"
        aside={aside}
        tracks={albumTracklist}
        tracklistLoading={!mounted || albumTracklist === null}
        coverViewTransitionName={`album-cover-${album.id}`}
      />

      {modalOpen && (
        <SelectedAlbumModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          album={album as Album}
          isInCollection={Boolean(collectionEntry)}
          isPending={Boolean(pending) && !collectionEntry}
          pendingData={pending}
          collectionData={collectionEntry}
          startEditing={Boolean(collectionEntry)}
          startMovingToCollection={Boolean(pending) && !collectionEntry}
          onSaved={onSaved}
          onPendingSaved={onPendingSaved}
          onPendingRemoved={onPendingRemoved}
        />
      )}
    </>
  );
}
