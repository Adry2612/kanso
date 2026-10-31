import { normalizeMood, normalizeMoods } from "@/constants/moods";
import { normalizeTagCategory, tagKey, uniqueTags } from "@/utils/tags";
import { formatLongDate } from "@/utils/dates";
import type {
  CollectionFilters,
  CollectionAlbum,
  CollectionGroupBy,
  CollectionTag,
  FilterOptions,
  GroupedCollection,
  SortMethod,
} from "@/types/collection";

const GENRE_TAG_CATEGORIES = ["género", "genero", "genre"];

const normalizeGenre = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

/**
 * Resuelve los géneros disponibles de una entrada: el campo `genres` del álbum
 * más las etiquetas personales cuya categoría sea un género.
 */
const getCollectionGenres = (entry: CollectionAlbum): string[] => {
  const fromAlbum = Array.isArray(entry.album.genres) ? entry.album.genres : [];
  const fromTags = (entry.tags ?? [])
    .filter((tag) =>
      GENRE_TAG_CATEGORIES.includes(
        String(tag.category ?? "")
          .trim()
          .toLowerCase(),
      ),
    )
    .map((tag) => tag.value);

  return [...fromAlbum, ...fromTags].map(normalizeGenre).filter(Boolean);
};

/** Valor de grupo para álbumes sin artista, título o año reconocible. */
export const UNKNOWN_GROUP = "__unknown__";

const groupSortValue = (
  entry: CollectionAlbum,
  groupBy: CollectionGroupBy,
): { label: string; order: string | number } => {
  switch (groupBy) {
    case "date":
      return {
        label: formatLongDate(entry.savedAt),
        order: new Date(entry.savedAt).getTime(),
      };
    case "artist":
      return {
        label: entry.album.artists[0]?.name?.trim() || UNKNOWN_GROUP,
        order: entry.album.artists[0]?.name?.trim() || UNKNOWN_GROUP,
      };
    case "letter": {
      const initial = entry.album.name?.trim()[0]?.toUpperCase() ?? "";
      return {
        label: /[A-ZÁÉÍÓÚÜÑ]/.test(initial) ? initial : "#",
        order: /[A-ZÁÉÍÓÚÜÑ]/.test(initial) ? initial : "#",
      };
    }
    case "year": {
      const year = new Date(entry.album.release_date).getFullYear();
      return {
        label: Number.isNaN(year) ? UNKNOWN_GROUP : String(year),
        order: Number.isNaN(year) ? -Infinity : year,
      };
    }
    default:
      return { label: UNKNOWN_GROUP, order: UNKNOWN_GROUP };
  }
};

const compareGroupEntries = (
  a: [string, CollectionAlbum[], string | number],
  b: [string, CollectionAlbum[], string | number],
  groupBy: CollectionGroupBy,
): number => {
  if (groupBy === "artist" || groupBy === "letter") {
    if (a[0] === UNKNOWN_GROUP) return 1;
    if (b[0] === UNKNOWN_GROUP) return -1;
    return String(a[0]).localeCompare(String(b[0]));
  }

  if (groupBy === "year") {
    if (a[2] === -Infinity) return 1;
    if (b[2] === -Infinity) return -1;
    return Number(b[2]) - Number(a[2]);
  }

  return Number(b[2]) - Number(a[2]);
};

export function sortCollection(
  collection: CollectionAlbum[],
  sortMethod: SortMethod,
): CollectionAlbum[] {
  const result = [...collection];

  switch (sortMethod) {
    case "recent":
      return result.sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      );
    case "oldest":
      return result.sort(
        (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime(),
      );
    case "name-asc":
      return result.sort((a, b) => a.album.name.localeCompare(b.album.name));
    case "name-desc":
      return result.sort((a, b) => b.album.name.localeCompare(a.album.name));
    case "artist":
      return result.sort((a, b) =>
        (a.album.artists[0]?.name ?? "").localeCompare(
          b.album.artists[0]?.name ?? "",
        ),
      );
    case "release-year-asc":
      return result.sort((a, b) => {
        const yearA = new Date(a.album.release_date).getFullYear();
        const yearB = new Date(b.album.release_date).getFullYear();
        return yearA - yearB;
      });
    case "release-year-desc":
      return result.sort((a, b) => {
        const yearA = new Date(a.album.release_date).getFullYear();
        const yearB = new Date(b.album.release_date).getFullYear();
        return yearB - yearA;
      });
    default:
      return result;
  }
}

/**
 * Coloca primero las emociones que coinciden con el filtro activo, sin alterar
 * el orden relativo dentro de cada grupo. Sin filtro devuelve el orden original.
 */
export function prioritizeMoods<T extends string>(
  moods: T[],
  highlighted: string[],
): T[] {
  if (highlighted.length === 0) return moods;

  const highlightedSet = new Set(
    highlighted
      .map((mood) => normalizeMood(mood))
      .filter((mood) => mood !== null),
  );
  if (highlightedSet.size === 0) return moods;

  const matching: T[] = [];
  const rest: T[] = [];

  for (const mood of moods) {
    const normalized = normalizeMood(mood);
    if (normalized && highlightedSet.has(normalized)) {
      matching.push(mood);
    } else {
      rest.push(mood);
    }
  }

  return [...matching, ...rest];
}

export function filterCollection(
  collection: CollectionAlbum[],
  filters: FilterOptions,
): CollectionAlbum[] {
  if (
    filters.moods.length === 0 &&
    filters.genres.length === 0 &&
    filters.formats.length === 0 &&
    filters.tags.length === 0 &&
    !filters.incompleteOnly
  ) {
    return collection;
  }

  return collection.filter((entry) => {
    const feelings = (entry.labeledFeelings ?? entry.moods ?? [])
      .map(normalizeMood)
      .filter(Boolean);

    const formats = (
      Array.isArray(entry.format)
        ? entry.format
        : entry.format
          ? [entry.format]
          : entry.ownership?.type === "physical"
            ? Array.isArray(entry.ownership.format)
              ? entry.ownership.format
              : [entry.ownership.format]
            : ["digital"]
    )
      .filter(Boolean)
      .map((value) => value.toLowerCase());
    const matchesMoods =
      filters.moods.length === 0 ||
      filters.moods.some((mood) => feelings.includes(normalizeMood(mood)));
    const genres = getCollectionGenres(entry);
    const matchesGenres =
      filters.genres.length === 0 ||
      filters.genres.some((genre) => genres.includes(normalizeGenre(genre)));
    const matchesFormats =
      filters.formats.length === 0 ||
      filters.formats.some((format) => formats.includes(format));
    const entryTags = entry.tags ?? [];
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) =>
        entryTags.some(
          (entryTag) =>
            normalizeTagCategory(entryTag.category) ===
              normalizeTagCategory(tag.category) &&
            entryTag.value.toLowerCase() === tag.value.toLowerCase(),
        ),
      );
    const matchesIncomplete =
      !filters.incompleteOnly ||
      (entry.labeledFeelings ?? entry.moods ?? []).length === 0 ||
      (entry.activities ?? []).length === 0;

    return (
      matchesMoods &&
      matchesGenres &&
      matchesFormats &&
      matchesTags &&
      matchesIncomplete
    );
  });
}

export function groupCollection(
  collection: CollectionAlbum[],
  groupBy: CollectionGroupBy,
  locale = "es",
): GroupedCollection[] {
  if (!collection || collection.length === 0) return [];
  if (groupBy === "none") return [];

  const groups = new Map<
    string,
    { items: CollectionAlbum[]; order: string | number }
  >();

  collection.forEach((entry) => {
    const descriptor =
      groupBy === "date"
        ? {
            label: formatLongDate(entry.savedAt, locale),
            order: new Date(entry.savedAt).getTime(),
          }
        : groupSortValue(entry, groupBy);

    const current = groups.get(descriptor.label);
    if (current) {
      current.items.push(entry);
    } else {
      groups.set(descriptor.label, {
        items: [entry],
        order: descriptor.order,
      });
    }
  });

  return Array.from(groups.entries())
    .map(
      ([label, value]) =>
        [label, value.items, value.order] as [
          string,
          CollectionAlbum[],
          string | number,
        ],
    )
    .sort((a, b) => compareGroupEntries(a, b, groupBy))
    .map(([groupName, items]) => ({ groupName, items }));
}

/** Filtra la colección por título o artistas. */
export function filterCollectionByQuery(
  collection: CollectionAlbum[],
  query: string,
): CollectionAlbum[] {
  const term = query.trim().toLowerCase();
  if (!term) return collection;

  return collection.filter((entry) => {
    const album = entry.album;
    const artists = (album.artists ?? [])
      .map((artist) => artist?.name ?? "")
      .join(" ");
    return `${album.name ?? ""} ${artists}`.toLowerCase().includes(term);
  });
}

/** Emociones disponibles en la colección, ordenadas por su etiqueta visible. */
export function getAvailableMoods(
  collection: CollectionAlbum[],
  translateMood?: (mood: string) => string,
): string[] {
  const moods = collection.flatMap(
    (entry) => entry.labeledFeelings ?? entry.moods ?? [],
  );
  return normalizeMoods(moods).sort((a, b) =>
    translateMood
      ? translateMood(a).localeCompare(translateMood(b))
      : a.localeCompare(b),
  );
}

export type CollectionInsights = {
  incomplete: number;
  missingMoods: number;
  missingActivities: number;
};

/** Un álbum está incompleto si le falta emoción o actividad. */
export function isCollectionEntryIncomplete(entry: CollectionAlbum): boolean {
  const hasMoods = (entry.labeledFeelings ?? entry.moods ?? []).length > 0;
  const hasActivities = (entry.activities ?? []).length > 0;
  return !hasMoods || !hasActivities;
}

/** Recuento de álbumes incompletos, sin duplicar los que fallan en ambas cosas. */
export function getCollectionInsights(
  collection: CollectionAlbum[],
): CollectionInsights {
  return collection.reduce<CollectionInsights>(
    (insights, entry) => {
      const missingMoods =
        (entry.labeledFeelings ?? entry.moods ?? []).length === 0;
      const missingActivities = (entry.activities ?? []).length === 0;

      if (missingMoods) insights.missingMoods += 1;
      if (missingActivities) insights.missingActivities += 1;
      if (missingMoods || missingActivities) insights.incomplete += 1;

      return insights;
    },
    { incomplete: 0, missingMoods: 0, missingActivities: 0 },
  );
}

/** Número de artistas distintos en una lista de entradas con álbum. */
export function countDistinctArtists(
  items: { album?: { artists?: { name?: string }[] } | null }[],
): number {
  return new Set(
    items
      .map((entry) => entry.album?.artists?.[0]?.name)
      .filter((name): name is string => Boolean(name)),
  ).size;
}

/** Número de artistas distintos con al menos un álbum en la colección. */
export function countCollectionArtists(collection: CollectionAlbum[]): number {
  return countDistinctArtists(collection);
}

/** Número de emociones distintas presentes en la colección. */
export function countCollectionMoods(collection: CollectionAlbum[]): number {
  return new Set(
    collection.flatMap((entry) => entry.labeledFeelings ?? entry.moods ?? []),
  ).size;
}

/** Etiquetas únicas de la colección, con la categoría normalizada. */
export function getAvailableTags(
  collection: CollectionAlbum[],
): CollectionTag[] {
  return uniqueTags(collection.flatMap((entry) => entry.tags ?? []));
}

export function hasCollectionFilters(
  query: string,
  filters: CollectionFilters,
): boolean {
  return Boolean(
    query.trim() ||
    filters.groupBy !== "none" ||
    filters.incompleteOnly ||
    filters.moods.length > 0 ||
    filters.genres.length > 0 ||
    filters.formats.length > 0 ||
    filters.tags.length > 0,
  );
}

export function countActiveFilters(filters: CollectionFilters): number {
  return (
    (filters.groupBy !== "none" ? 1 : 0) +
    (filters.incompleteOnly ? 1 : 0) +
    filters.moods.length +
    filters.genres.length +
    filters.formats.length +
    filters.tags.length
  );
}

/** Convierte `name-asc` en la clave de traducción `nameAsc`. */
export function sortKeyToI18nKey(sortKey: SortMethod): string {
  return sortKey
    .replace(/-./g, (match) => match[1].toUpperCase())
    .replace(/^./, (match) => match.toLowerCase());
}

export function tagCategoryI18nKey(
  category: string,
): "categories.language" | "categories.genre" | "categories.other" {
  const normalized = normalizeTagCategory(category);
  if (normalized === "idioma") return "categories.language";
  if (normalized === "género") return "categories.genre";
  return "categories.other";
}

export { tagKey };

export type { SortMethod, FilterOptions };
