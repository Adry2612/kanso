"use client";

import type { RefObject } from "react";
import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import { deriveBackdropColor } from "@/utils/color";

/** Color de respaldo cuando la portada no se puede analizar. */
export const DEFAULT_ALBUM_BACKDROP = "rgba(6, 78, 59, 0.8)";

/**
 * Deriva el degradado de fondo del color dominante de una portada.
 *
 * Recibe la referencia a la imagen y su `src`; cuando cambia la portada se
 * vuelve a calcular el color. Si el análisis falla (por ejemplo, una imagen sin
 * cabeceras CORS) se conserva el color por defecto, así que la ficha siempre
 * tiene un fondo válido.
 */
export function useAlbumBackdrop(
  imgRef: RefObject<HTMLImageElement | null>,
  src?: string,
): string {
  const [bgColor, setBgColor] = useState(DEFAULT_ALBUM_BACKDROP);

  useEffect(() => {
    if (!src || !imgRef.current) {
      setBgColor(DEFAULT_ALBUM_BACKDROP);
      return;
    }

    let active = true;
    const fac = new FastAverageColor();

    fac
      .getColorAsync(imgRef.current, { algorithm: "dominant" })
      .then((color) => {
        if (!active) return;
        setBgColor(
          deriveBackdropColor([color.value[0], color.value[1], color.value[2]]),
        );
      })
      .catch(() => {
        if (active) setBgColor(DEFAULT_ALBUM_BACKDROP);
      });

    return () => {
      active = false;
      fac.destroy();
    };
  }, [imgRef, src]);

  return bgColor;
}
