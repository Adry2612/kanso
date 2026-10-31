import { normalizeTagCategory, tagKey, uniqueTags } from "@/utils/tags";

export { normalizeTagCategory, tagKey, uniqueTags };

/** Categorías que la aplicación entiende y ofrece al guardar un disco. */
export type TagCategory = "idioma" | "género";

export const TAG_CATEGORIES: TagCategory[] = ["idioma", "género"];
