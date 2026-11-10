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
  /**
   * Velo inferior para dar contraste a contenido superpuesto. Por defecto no
   * se pinta, de modo que la portada conserva todo su brillo cuando no hay
   * insignias encima.
   */
  scrim?: "none" | "soft";
  /** Contenido superpuesto: enlaces, insignias o acciones. */
  children?: ReactNode;
};

/**
 * Marco único de portada de álbum.
 *
 * Concentra borde, fondo, velo opcional, carga diferida y respaldo para que
 * todas las pantallas presenten la portada igual. Las tarjetas añaden sus
 * propios enlaces y acciones como contenido superpuesto.
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
  scrim = "none",
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
      {scrim === "soft" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      )}
      {children}
    </div>
  );
}
