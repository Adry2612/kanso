import type { CollectionTag } from "@/types/collection";
import { normalizeTagCategory, tagKey } from "@/utils/tags";
import { GENRE_BRANCHES, type GenreBranch } from "@/utils/genres";
import taxonomyAliases from "./taxonomy.json";

/** Ramas de género que entiende la aplicación. */
export const GENRE_KEYS = GENRE_BRANCHES;
export type GenreKey = GenreBranch;

/** Idiomas admitidos, identificados por su código ISO 639-1. */
export const LANGUAGE_KEYS = [
  "es",
  "en",
  "fr",
  "de",
  "it",
  "pt",
  "ja",
  "ko",
  "ru",
  "ar",
  "nl",
  "sv",
  "ca",
  "gl",
  "eu",
  "zh",
  "hi",
  "tr",
  "pl",
  "el",
] as const;

export type LanguageKey = (typeof LANGUAGE_KEYS)[number];

type Translator = (key: string) => string;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const buildAliasMap = <Key extends string>(
  aliases: Record<string, readonly string[]>,
): Map<string, Key> => {
  const map = new Map<string, Key>();

  for (const [key, values] of Object.entries(aliases)) {
    map.set(normalizeText(key), key as Key);
    values.forEach((value) => map.set(normalizeText(value), key as Key));
  }

  return map;
};

const GENRE_ALIASES = buildAliasMap<GenreKey>(taxonomyAliases.genres);
const LANGUAGE_ALIASES = buildAliasMap<LanguageKey>(taxonomyAliases.languages);

/** Resuelve un valor de género (canónico o heredado) a su clave canónica. */
export function normalizeGenreValue(value: unknown): GenreKey | null {
  if (typeof value !== "string") return null;
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return GENRE_ALIASES.get(normalized) ?? null;
}

/** Resuelve un valor de idioma (código o nombre) a su código ISO. */
export function normalizeLanguageValue(value: unknown): LanguageKey | null {
  if (typeof value !== "string") return null;
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return LANGUAGE_ALIASES.get(normalized) ?? null;
}

export function isGenreKey(value: string): value is GenreKey {
  return GENRE_KEYS.includes(value as GenreKey);
}

export function isLanguageKey(value: string): value is LanguageKey {
  return (LANGUAGE_KEYS as readonly string[]).includes(value);
}

/**
 * Normaliza una etiqueta personal.
 *
 * Idioma y género se resuelven contra el catálogo; un valor fuera de él se
 * descarta (`null`). Las categorías heredadas se conservan para no perder
 * datos antiguos.
 */
export function canonicalizeTag(tag: CollectionTag): CollectionTag | null {
  const value = tag.value?.trim();
  if (!tag.category || !value) return null;

  const category = normalizeTagCategory(tag.category);

  if (category === "género") {
    const genre = normalizeGenreValue(value);
    return genre ? { category, value: genre } : null;
  }

  if (category === "idioma") {
    const language = normalizeLanguageValue(value);
    return language ? { category, value: language } : null;
  }

  return { category, value };
}

/**
 * Normaliza una lista de etiquetas y deja como máximo un idioma y un género.
 * Conserva el primer valor reconocido de cada eje y deduplica el resto.
 */
export function canonicalizeTags(
  tags: readonly CollectionTag[],
): CollectionTag[] {
  const result: CollectionTag[] = [];
  const seen = new Set<string>();
  let hasGenre = false;
  let hasLanguage = false;

  tags.forEach((tag) => {
    const canonical = canonicalizeTag(tag);
    if (!canonical) return;

    if (canonical.category === "género") {
      if (hasGenre) return;
      hasGenre = true;
    } else if (canonical.category === "idioma") {
      if (hasLanguage) return;
      hasLanguage = true;
    }

    const key = tagKey(canonical);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(canonical);
  });

  return result;
}

/** Nombre visible de una etiqueta según el diccionario de taxonomía. */
export function tagDisplayLabel(tag: CollectionTag, t: Translator): string {
  const category = normalizeTagCategory(tag.category);
  const value = tag.value?.trim() ?? "";
  if (!value) return "";

  if (category === "género") {
    const genre = normalizeGenreValue(value);
    return genre ? t(`genres.${genre}`) : value;
  }

  if (category === "idioma") {
    const language = normalizeLanguageValue(value);
    return language ? t(`languages.${language}`) : value;
  }

  return value;
}
