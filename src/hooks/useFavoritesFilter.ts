import { useMemo } from "react";
import {
  sortFavorites,
  filterFavorites,
  groupFavorites,
} from "@/utils/favoritesHelper";
import type {
  FavoriteAlbum,
  FilterOptions,
  SortMethod,
} from "@/types/favorites";

export function useFavoritesFilter(
  favorites: FavoriteAlbum[],
  sortMethod: SortMethod,
  filters: FilterOptions,
) {
  const filteredFavorites = useMemo(() => {
    return filterFavorites(favorites, filters);
  }, [favorites, filters]);

  const sortedFavorites = useMemo(() => {
    return sortFavorites(filteredFavorites, sortMethod);
  }, [filteredFavorites, sortMethod]);

  const groupedFavorites = useMemo(() => {
    return groupFavorites(sortedFavorites, sortMethod);
  }, [sortedFavorites, sortMethod]);

  return {
    filteredFavorites,
    sortedFavorites,
    groupedFavorites,
  };
}
