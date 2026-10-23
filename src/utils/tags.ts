import type { FavoriteTag } from "@/types/favorites";

/**
 * Unifica las variantes históricas de una categoría ("genero", "genre"...)
 * sin tocar las categorías libres que ya existan en la colección.
 */
export function normalizeTagCategory(category: string): string {
  const normalized = category.trim().toLowerCase();
  if (["idioma", "language", "lang"].includes(normalized)) return "idioma";
  if (["género", "genero", "genre", "gênero"].includes(normalized)) {
    return "género";
  }
  return normalized;
}

/** Clave estable para comparar y deduplicar etiquetas. */
export function tagKey(tag: Pick<FavoriteTag, "category" | "value">): string {
  return `${normalizeTagCategory(tag.category)}:${tag.value.trim().toLowerCase()}`;
}

/** Devuelve las etiquetas sin duplicados y con la categoría normalizada. */
export function uniqueTags(tags: FavoriteTag[]): FavoriteTag[] {
  const unique = new Map<string, FavoriteTag>();

  tags.forEach((tag) => {
    const value = tag.value?.trim();
    if (!tag.category || !value) return;
    const normalized: FavoriteTag = {
      category: normalizeTagCategory(tag.category),
      value,
    };
    if (!unique.has(tagKey(normalized)))
      unique.set(tagKey(normalized), normalized);
  });

  return Array.from(unique.values());
}
