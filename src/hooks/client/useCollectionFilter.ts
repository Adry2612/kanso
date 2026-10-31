import { useMemo } from "react";
import {
  sortCollection,
  filterCollection,
  groupCollection,
} from "@/utils/collection";
import type {
  CollectionAlbum,
  FilterOptions,
  GroupedCollection,
  SortMethod,
} from "@/types/collection";

export function useCollectionFilter(
  collection: CollectionAlbum[],
  sortMethod: SortMethod,
  filters: FilterOptions,
  locale = "es",
) {
  const filteredCollection = useMemo(() => {
    return filterCollection(collection, filters);
  }, [collection, filters]);

  const sortedCollection = useMemo(() => {
    return sortCollection(filteredCollection, sortMethod);
  }, [filteredCollection, sortMethod]);

  const collectionGroups = useMemo<GroupedCollection[]>(
    () => groupCollection(sortedCollection, filters.groupBy, locale),
    [sortedCollection, filters.groupBy, locale],
  );

  return {
    filteredCollection,
    sortedCollection,
    collectionGroups,
  };
}
