import type { CollectionFormat } from "@/types/collection";

const COLLECTION_FORMATS: readonly CollectionFormat[] = [
  "digital",
  "cd",
  "cassette",
  "vinyl",
];

function isCollectionFormat(value: unknown): value is CollectionFormat {
  return (
    typeof value === "string" &&
    COLLECTION_FORMATS.includes(value as CollectionFormat)
  );
}

/**
 * Normaliza los formatos de una entrada de la colección.
 *
 * Las entradas antiguas guardaban un único `format` como string y, antes aún,
 * el formato vivía en `ownership`. La API expone siempre un array para que la
 * colección propia y la biblioteca compartida tengan el mismo contrato.
 */
export function normalizeCollectionFormats(
  format: unknown,
  ownership?: unknown,
): CollectionFormat[] {
  if (Array.isArray(format)) {
    return format.filter(isCollectionFormat);
  }

  if (isCollectionFormat(format)) {
    return [format];
  }

  const owner =
    ownership && typeof ownership === "object"
      ? (ownership as Record<string, unknown>)
      : null;

  if (owner?.type === "physical") {
    if (Array.isArray(owner.format)) {
      return owner.format.filter(isCollectionFormat);
    }
    if (isCollectionFormat(owner.format)) {
      return [owner.format];
    }
  }

  return ["digital"];
}
