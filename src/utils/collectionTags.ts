import { canonicalizeTags } from "@/constants/taxonomy";
import type { CollectionTag } from "@/types/collection";

/**
 * Sanea las etiquetas que llegan a la API antes de guardarlas.
 *
 * Descarta entradas que no sean texto, resuelve idioma y género contra el
 * catálogo canónico y conserva las categorías heredadas. Una etiqueta de
 * idioma o género con un valor inventado no llega a Firestore.
 */
export function sanitizeCollectionTags(input: unknown): CollectionTag[] {
  if (!Array.isArray(input)) return [];

  const valid = input.filter(
    (tag): tag is CollectionTag =>
      typeof (tag as { category?: unknown })?.category === "string" &&
      typeof (tag as { value?: unknown })?.value === "string",
  );

  return canonicalizeTags(valid);
}
