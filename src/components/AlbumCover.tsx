/* eslint-disable @next/next/no-img-element -- portadas del CDN de Spotify; la optimización de imágenes se decide en improve-performance */
import type { CSSProperties, ReactNode, Ref } from "react";
import { Music2 } from "lucide-react";

type AlbumCoverProps = {
  src?: string;
  alt: string;
  /** Tamaño y radio del contenedor; por defecto, el marco de cuadrícula. */
  className?: string;
  priority?: boolean;
  /** Nombre de la transición de vista para la portada del álbum. */
  viewTransitionName?: string;
  /** Referencia a la imagen, para derivar el color de fondo. */
  imageRef?: Ref<HTMLImageElement>;
  /** Necesario para leer los píxeles de la portada desde un canvas. */
  crossOrigin?: "anonymous" | "use-credentials";
  /** Ampliación de la imagen al pasar el puntero; la ficha la desactiva. */
  hoverZoom?: boolean;
  /** Contenido superpuesto: enlaces, insignias o acciones. */
  children?: ReactNode;
};

/**
 * Marco único de portada de álbum.
 *
 * Concentra borde, fondo, degradado, carga diferida y respaldo para que todas
 * las pantallas presenten la portada igual. Las tarjetas añaden sus propios
 * enlaces y acciones como contenido superpuesto.
 */
export default function AlbumCover({
  src,
  alt,
  className = "rounded-2xl",
  priority = false,
  viewTransitionName,
  imageRef,
  crossOrigin,
  hoverZoom = true,
  children,
}: AlbumCoverProps) {
  const imageStyle: CSSProperties | undefined = viewTransitionName
    ? { viewTransitionName }
    : undefined;

  return (
    <div
      className={`relative aspect-square overflow-hidden border border-[var(--kanso-line)] bg-[var(--surface-2)] ${className}`}
    >
      {src ? (
        <img
          ref={imageRef}
          crossOrigin={crossOrigin}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          src={src}
          alt={alt}
          style={imageStyle}
          className={`h-full w-full object-cover transition duration-500 ${
            hoverZoom ? "group-hover:scale-[1.04]" : ""
          }`}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[var(--kanso-muted)]">
          <Music2 className="h-8 w-8" aria-hidden="true" />
        </span>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
      {children}
    </div>
  );
}
