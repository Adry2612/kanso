/** Oscurece un color RGB para usarlo como fondo derivado de la portada. */
export function deriveBackdropColor(
  rgb: readonly [number, number, number],
  factor = 0.6,
  alpha = 0.8,
): string {
  const [red, green, blue] = rgb;
  return `rgba(${Math.floor(red * factor)}, ${Math.floor(
    green * factor,
  )}, ${Math.floor(blue * factor)}, ${alpha})`;
}
