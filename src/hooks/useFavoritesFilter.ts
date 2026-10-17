import { useMemo } from "react";
import {
  sortFavorites,
  filterFavorites,
  groupFavorites,
  type SortMethod,
  type FilterOptions,
} from "@/utils/favoritesHelper";

export function useFavoritesFilter(
  favorites: unknown[],
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
