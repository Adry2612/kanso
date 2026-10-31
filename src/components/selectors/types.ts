import type { ReactNode } from "react";

export type OptionSelection = "single" | "multiple";
export type OptionLayout = "grid" | "carousel";
export type OptionSemantics = "listbox" | "buttons";
export type OptionPresentation = "tile" | "stacked";

export type OptionItem = {
  key: string;
  label: string;
  /** Icono de formato; el nombre accesible sigue siendo `label`. */
  icon?: ReactNode;
  /** Emoji de emoción o actividad. */
  emoji?: string;
  disabled?: boolean;
};
