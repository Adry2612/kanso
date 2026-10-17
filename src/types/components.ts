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
  currentFilters: {
    moods: string[];
    genres: string[];
    formats: FavoriteFormat[];
    tags: FavoriteTag[];
  };
  onFiltersChange: (filters: {
    moods: string[];
    genres: string[];
    formats: FavoriteFormat[];
    tags: FavoriteTag[];
  }) => void;
}

import type { FavoriteFormat, FavoriteTag } from "./favorites";
