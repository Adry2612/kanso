import type { FavoriteTag } from "@/types/favorites";

/** Categorías que la aplicación entiende y ofrece al guardar un disco. */
export type TagCategory = "idioma" | "género";

export const TAG_CATEGORIES: TagCategory[] = ["idioma", "género"];

/** Valores frecuentes para no tener que escribirlos cada vez. */
export const TAG_SUGGESTIONS: Record<
  "es" | "en",
  Record<TagCategory, string[]>
> = {
  es: {
    idioma: [
      "Español",
      "Inglés",
      "Francés",
      "Alemán",
      "Italiano",
      "Portugués",
      "Japonés",
      "Coreano",
      "Ruso",
      "Árabe",
      "Neerlandés",
      "Sueco",
    ],
    género: [
      "Pop",
      "Rock",
      "Hip-hop",
      "R&B",
      "Jazz",
      "Electrónica",
      "Clásica",
      "Metal",
      "Indie",
      "Folk",
      "Reggaetón",
      "Soul",
      "Punk",
      "Country",
      "Ambient",
      "Blues",
    ],
  },
  en: {
    idioma: [
      "Spanish",
      "English",
      "French",
      "German",
      "Italian",
      "Portuguese",
      "Japanese",
      "Korean",
      "Russian",
      "Arabic",
      "Dutch",
      "Swedish",
    ],
    género: [
      "Pop",
      "Rock",
      "Hip-hop",
      "R&B",
      "Jazz",
      "Electronic",
      "Classical",
      "Metal",
      "Indie",
      "Folk",
      "Reggaeton",
      "Soul",
      "Punk",
      "Country",
      "Ambient",
      "Blues",
    ],
  },
};

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

export function isTagCategory(category: string): category is TagCategory {
  return TAG_CATEGORIES.includes(normalizeTagCategory(category) as TagCategory);
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
