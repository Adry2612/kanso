"use client";

import { useParams } from "next/navigation";
import { FaSpotify } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Trash2Icon } from "lucide-react";
import { useTransitionRouter } from "next-view-transitions";
import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import AlbumRecordPanel from "@/components/album/AlbumRecordPanel";
import AlbumShowcase from "@/components/album/AlbumShowcase";
import ErrorState from "@/components/ErrorState";
import { AlbumDetailSkeleton } from "@/components/ContentSkeletons";
import { useTranslations } from "@/context/I18nContext";
import { useAlbumDetail } from "@/hooks/client/useAlbumDetail";
import { openSpotify } from "@/lib/spotifyUtils";
import type { Album } from "@/types/album";

export default function AlbumDetail() {
  const t = useTranslations("album");
  const tCommon = useTranslations("common");
  const tModal = useTranslations("modal");
  const params = useParams();
  const albumId = params.albumId as string;
  const router = useTransitionRouter();
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
    <AlbumRecordPanel
      moods={savedMoods}
      activities={collectionEntry.activities}
      formats={savedFormats}
      tags={collectionEntry.tags}
    />
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
