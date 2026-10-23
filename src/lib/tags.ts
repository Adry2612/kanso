import { normalizeTagCategory, tagKey, uniqueTags } from "@/utils/tags";

export { normalizeTagCategory, tagKey, uniqueTags };

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

export function isTagCategory(category: string): category is TagCategory {
  return TAG_CATEGORIES.includes(normalizeTagCategory(category) as TagCategory);
}
