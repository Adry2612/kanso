export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: string;
  onSortChange: (value: string) => void;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: CollectionFilters;
  onFiltersChange: (filters: CollectionFilters) => void;
  /** Etiquetas presentes en la colección, para filtrar sin escribirlas. */
  availableTags?: CollectionTag[];
}

import type { CollectionFilters, CollectionTag } from "./collection";
