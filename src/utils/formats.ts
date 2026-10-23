import type { FavoriteFormat } from "@/types/favorites";

const FAVORITE_FORMATS: readonly FavoriteFormat[] = [
  "digital",
  "cd",
  "cassette",
  "vinyl",
];

function isFavoriteFormat(value: unknown): value is FavoriteFormat {
  return (
    typeof value === "string" &&
    FAVORITE_FORMATS.includes(value as FavoriteFormat)
  );
}

/**
 * Normaliza los formatos de un favorito.
 *
 * Los favoritos antiguos guardaban un único `format` como string y, antes aún,
 * el formato vivía en `ownership`. La API expone siempre un array para que la
 * colección propia y la biblioteca compartida tengan el mismo contrato.
 */
export function normalizeFavoriteFormats(
  format: unknown,
  ownership?: unknown,
): FavoriteFormat[] {
  if (Array.isArray(format)) {
    return format.filter(isFavoriteFormat);
  }

  if (isFavoriteFormat(format)) {
    return [format];
  }

  const owner =
    ownership && typeof ownership === "object"
      ? (ownership as Record<string, unknown>)
      : null;

  if (owner?.type === "physical") {
    if (Array.isArray(owner.format)) {
      return owner.format.filter(isFavoriteFormat);
    }
    if (isFavoriteFormat(owner.format)) {
      return [owner.format];
    }
  }

  return ["digital"];
}
