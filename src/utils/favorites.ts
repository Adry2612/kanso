import { normalizeMood, normalizeMoods } from "@/constants/moods";
import { normalizeTagCategory, tagKey, uniqueTags } from "@/utils/tags";
import type {
  CollectionFilters,
  FavoriteAlbum,
  FavoriteTag,
  FilterOptions,
  GroupedFavorites,
  SortMethod,
} from "@/types/favorites";

const GENRE_TAG_CATEGORIES = ["género", "genero", "genre"];

const normalizeGenre = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

/**
 * Resuelve los géneros disponibles de un favorito: el campo `genres` del álbum
 * más las etiquetas personales cuya categoría sea un género.
 */
const getFavoriteGenres = (favorite: FavoriteAlbum): string[] => {
  const fromAlbum = Array.isArray(favorite.album.genres)
    ? favorite.album.genres
    : [];
  const fromTags = (favorite.tags ?? [])
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

const getGroupKey = (
  favorite: FavoriteAlbum,
  sortMethod: SortMethod,
): string => {
  switch (sortMethod) {
    case "artist":
      return favorite.album.artists[0]?.name ?? "";
    case "name-asc":
    case "name-desc":
      return favorite.album.name[0]?.toUpperCase() ?? "";
    case "recent":
    case "oldest":
      return new Date(favorite.savedAt).getFullYear().toString();
    case "release-year-asc":
    case "release-year-desc":
      return new Date(favorite.album.release_date).getFullYear().toString();
    default:
      return "";
  }
};

const sortGroupKeys = (keys: string[], sortMethod: SortMethod): string[] => {
  return keys.sort((a, b) => {
    if (sortMethod === "name-desc") return b.localeCompare(a);
    if (sortMethod === "oldest" || sortMethod === "release-year-asc") {
      return parseInt(a) - parseInt(b);
    }
    if (sortMethod === "recent" || sortMethod === "release-year-desc") {
      return parseInt(b) - parseInt(a);
    }
    return a.localeCompare(b);
  });
};

const sortItemsInGroup = (
  items: FavoriteAlbum[],
  sortMethod: SortMethod,
): FavoriteAlbum[] => {
  if (sortMethod === "artist") {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.album.release_date).getTime();
      const dateB = new Date(b.album.release_date).getTime();
      return dateB - dateA;
    });
  }
  return items;
};

export function sortFavorites(
  favorites: FavoriteAlbum[],
  sortMethod: SortMethod,
): FavoriteAlbum[] {
  const result = [...favorites];

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

export function filterFavorites(
  favorites: FavoriteAlbum[],
  filters: FilterOptions,
): FavoriteAlbum[] {
  if (
    filters.moods.length === 0 &&
    filters.genres.length === 0 &&
    filters.formats.length === 0 &&
    filters.tags.length === 0
  ) {
    return favorites;
  }

  return favorites.filter((favorite) => {
    const feelings = (favorite.labeledFeelings ?? favorite.moods ?? [])
      .map(normalizeMood)
      .filter(Boolean);

    const formats = (
      Array.isArray(favorite.format)
        ? favorite.format
        : favorite.format
          ? [favorite.format]
          : favorite.ownership?.type === "physical"
            ? Array.isArray(favorite.ownership.format)
              ? favorite.ownership.format
              : [favorite.ownership.format]
            : ["digital"]
    )
      .filter(Boolean)
      .map((value) => value.toLowerCase());
    const matchesMoods =
      filters.moods.length === 0 ||
      filters.moods.some((mood) => feelings.includes(normalizeMood(mood)));
    const genres = getFavoriteGenres(favorite);
    const matchesGenres =
      filters.genres.length === 0 ||
      filters.genres.some((genre) => genres.includes(normalizeGenre(genre)));
    const matchesFormats =
      filters.formats.length === 0 ||
      filters.formats.some((format) => formats.includes(format));
    const favoriteTags = favorite.tags ?? [];
    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) =>
        favoriteTags.some(
          (favoriteTag) =>
            normalizeTagCategory(favoriteTag.category) ===
              normalizeTagCategory(tag.category) &&
            favoriteTag.value.toLowerCase() === tag.value.toLowerCase(),
        ),
      );
    return matchesMoods && matchesGenres && matchesFormats && matchesTags;
  });
}

export function groupFavorites(
  favorites: FavoriteAlbum[],
  sortMethod: SortMethod,
): GroupedFavorites[] {
  if (!favorites || favorites.length === 0) return [];

  if (!sortMethod) {
    return [{ groupName: "", items: favorites }];
  }

  const groups = favorites.reduce<Record<string, FavoriteAlbum[]>>(
    (acc, favorite) => {
      const key = getGroupKey(favorite, sortMethod);
      if (!acc[key]) acc[key] = [];
      acc[key].push(favorite);
      return acc;
    },
    {},
  );

  return sortGroupKeys(Object.keys(groups), sortMethod).map((key) => ({
    groupName: key,
    items: sortItemsInGroup(groups[key], sortMethod),
  }));
}

/** Filtra la colección por título o artistas. */
export function filterFavoritesByQuery(
  favorites: FavoriteAlbum[],
  query: string,
): FavoriteAlbum[] {
  const term = query.trim().toLowerCase();
  if (!term) return favorites;

  return favorites.filter((favorite) => {
    const album = favorite.album;
    const artists = (album.artists ?? [])
      .map((artist) => artist?.name ?? "")
      .join(" ");
    return `${album.name ?? ""} ${artists}`.toLowerCase().includes(term);
  });
}

/** Emociones disponibles en la colección, ordenadas por su etiqueta visible. */
export function getAvailableMoods(
  favorites: FavoriteAlbum[],
  translateMood?: (mood: string) => string,
): string[] {
  const moods = favorites.flatMap(
    (favorite) => favorite.labeledFeelings ?? favorite.moods ?? [],
  );
  return normalizeMoods(moods).sort((a, b) =>
    translateMood
      ? translateMood(a).localeCompare(translateMood(b))
      : a.localeCompare(b),
  );
}

/** Etiquetas únicas de la colección, con la categoría normalizada. */
export function getAvailableTags(favorites: FavoriteAlbum[]): FavoriteTag[] {
  return uniqueTags(favorites.flatMap((favorite) => favorite.tags ?? []));
}

export function hasCollectionFilters(
  query: string,
  filters: CollectionFilters,
): boolean {
  return Boolean(
    query.trim() ||
    filters.moods.length > 0 ||
    filters.genres.length > 0 ||
    filters.formats.length > 0 ||
    filters.tags.length > 0,
  );
}

export function countActiveFilters(filters: CollectionFilters): number {
  return (
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
