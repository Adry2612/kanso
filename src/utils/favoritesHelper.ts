/* eslint-disable @typescript-eslint/no-explicit-any */

import { SortMethod, FilterOptions, GroupedFavorites } from "@/types/favorites";
import { normalizeMood } from "@/constants/moods";

const GENRE_TAG_CATEGORIES = ["género", "genero", "genre"];

const normalizeGenre = (value: unknown): string =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

/**
 * Resolves the genres available for a favorite: the album's own `genres` field
 * plus any user tag whose category is a genre. Returns lowercased, non-empty
 * values so filtering never throws on missing metadata.
 */
const getFavoriteGenres = (favorite: any): string[] => {
  const fromAlbum = Array.isArray(favorite?.album?.genres)
    ? favorite.album.genres
    : [];
  const fromTags = (Array.isArray(favorite?.tags) ? favorite.tags : [])
    .filter((tag: { category?: string }) =>
      GENRE_TAG_CATEGORIES.includes(
        String(tag?.category ?? "")
          .trim()
          .toLowerCase(),
      ),
    )
    .map((tag: { value?: string }) => tag?.value);

  return [...fromAlbum, ...fromTags].map(normalizeGenre).filter(Boolean);
};

const getGroupKey = (favorite: any, sortMethod: SortMethod): string => {
  switch (sortMethod) {
    case "artist":
      return favorite.album.artists[0].name;
    case "name-asc":
    case "name-desc":
      return favorite.album.name[0].toUpperCase();
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

const sortItemsInGroup = (items: any[], sortMethod: SortMethod): any[] => {
  if (sortMethod === "artist") {
    return items.sort((a, b) => {
      const dateA = new Date(a.album.release_date).getTime();
      const dateB = new Date(b.album.release_date).getTime();
      return dateB - dateA;
    });
  }
  return items;
};

export function sortFavorites(favorites: any[], sortMethod: SortMethod): any[] {
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
        a.album.artists[0].name.localeCompare(b.album.artists[0].name),
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
  favorites: any[],
  filters: FilterOptions,
): any[] {
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
      .map((value: string) => value.toLowerCase());
    const matchesMoods =
      filters.moods.length === 0 ||
      filters.moods.some((mood) => feelings.includes(normalizeMood(mood)));
    // Genres come from the album document and from the user's own tags whose
    // category is a genre ("género"/"genero"/"genre"). Albums with no known
    // genre never match an active genre filter (see change design.md).
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
          (favoriteTag: { category: string; value: string }) =>
            favoriteTag.category.toLowerCase() === tag.category.toLowerCase() &&
            favoriteTag.value.toLowerCase() === tag.value.toLowerCase(),
        ),
      );
    return matchesMoods && matchesGenres && matchesFormats && matchesTags;
  });
}

export function groupFavorites(
  favorites: any[],
  sortMethod: SortMethod,
): GroupedFavorites[] {
  if (!sortMethod) {
    return [{ groupName: "", items: favorites }];
  }

  const groups = favorites.reduce((acc: { [key: string]: any[] }, favorite) => {
    const key = getGroupKey(favorite, sortMethod);
    if (!acc[key]) acc[key] = [];
    acc[key].push(favorite);
    return acc;
  }, {});

  return sortGroupKeys(Object.keys(groups), sortMethod).map((key) => ({
    groupName: key,
    items: sortItemsInGroup(groups[key], sortMethod),
  }));
}

export type { SortMethod, FilterOptions };
