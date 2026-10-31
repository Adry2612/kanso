"use client";

import { useRef, useState, type ReactNode } from "react";
import AlbumCover from "@/components/AlbumCover";
import AlbumTracklist, {
  type TrackListItem,
} from "@/components/AlbumTracklist";
import { EASE_OUT, motion, useReducedMotion } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import { useAlbumBackdrop } from "@/hooks/client/useAlbumBackdrop";
import CoverViewer from "./CoverViewer";

type ShowcaseAlbum = {
  id?: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
};

type AlbumShowcaseProps = {
  album: ShowcaseAlbum;
  /** Etiqueta pequeña sobre el título ("Álbum seleccionado", "Recomendación…"). */
  eyebrow: ReactNode;
  description?: ReactNode;
  /** Acciones principales de la pantalla (Spotify, colección…). */
  actions?: ReactNode;
  onBack: () => void;
  backLabel: string;
  /** Contenido propio que se coloca antes de la cabecera. */
  aboveHero?: ReactNode;
  /** Contenido propio bajo las acciones (emociones recomendadas…). */
  meta?: ReactNode;
  /** Panel lateral propio del detalle (datos guardados o pendientes). */
  aside?: ReactNode;
  tracks: TrackListItem[] | null;
  tracklistLoading?: boolean;
  coverViewTransitionName?: string;
};

/**
 * Ficha compartida de álbum.
 *
 * Detalle y recomendación presentan la misma estructura —fondo derivado de la
 * portada, volver, cabecera con portada clicable, tracklist y panel opcional—
 * y solo cambian los textos, las acciones y el contenido que pasan por props.
 * La portada abre el visor a pantalla completa.
 */
export default function AlbumShowcase({
  album,
  eyebrow,
  description,
  actions,
  onBack,
  backLabel,
  aboveHero,
  meta,
  aside,
  tracks,
  tracklistLoading = false,
  coverViewTransitionName,
}: AlbumShowcaseProps) {
  const t = useTranslations("album");
  const reduceMotion = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const coverButtonRef = useRef<HTMLButtonElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const cover = album.images[0]?.url;
  const bgColor = useAlbumBackdrop(imgRef, cover);

  const coverArt = (
    <AlbumCover
      src={cover}
      alt={album.name}
      priority
      imageRef={imgRef}
      crossOrigin="anonymous"
      hoverZoom={false}
      viewTransitionName={coverViewTransitionName}
      className="w-full rounded-[var(--radius-md)] shadow-2xl"
    />
  );

  return (
    <div className="relative min-h-screen">
      {/* Fondo derivado de la portada: vive fuera del ancho máximo para cubrir
          toda la pantalla, igual que en el detalle original. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${bgColor} 0%, transparent 60%)`,
        }}
      />

      <main className="kanso-main relative min-h-screen">
        <div className="relative pt-5 md:pt-16">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-xs text-[var(--kanso-mint)] transition hover:text-[var(--foreground)]"
          >
            ← {backLabel}
          </button>

          {aboveHero}

          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="grid w-full items-start gap-8 border-b border-[var(--kanso-line)] pb-10 md:grid-cols-[320px_1fr] md:gap-16 2xl:grid-cols-[380px_1fr]"
          >
            <div className="flex w-full flex-col items-center md:items-start">
              <div className="cover-ficha group relative w-full max-w-[320px] rounded-[var(--radius-md)] 2xl:max-w-[380px]">
                {coverArt}
                {cover && (
                  <button
                    ref={coverButtonRef}
                    type="button"
                    onClick={() => setViewerOpen(true)}
                    aria-label={t("viewCover")}
                    className="cover-zoom-trigger absolute inset-0 z-10 rounded-[var(--radius-md)] border-0 bg-transparent p-0"
                  />
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col pt-1">
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
                {eyebrow}
              </p>
              <h1 className="mt-3 max-w-4xl text-5xl font-semibold tracking-tight text-[var(--foreground)] md:text-7xl">
                {album.name}
              </h1>
              <h2 className="mt-4 text-base text-[var(--kanso-mint)]">
                {album.artists.map((artist) => artist.name).join(", ")}
              </h2>
              {description && (
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {description}
                </p>
              )}
              {actions && (
                <div className="mt-7 flex flex-wrap gap-2">{actions}</div>
              )}
              {meta}
            </div>
          </motion.section>

          <div
            className={
              aside
                ? "mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-12"
                : "mt-10"
            }
          >
            <AlbumTracklist
              tracks={tracks}
              loading={tracklistLoading}
              className={aside ? "max-w-none" : "max-w-2xl"}
            />
            {aside}
          </div>
        </div>
      </main>

      <CoverViewer
        open={viewerOpen}
        src={cover}
        albumName={album.name}
        onClose={() => setViewerOpen(false)}
        returnFocusRef={coverButtonRef}
      />
    </div>
  );
}
