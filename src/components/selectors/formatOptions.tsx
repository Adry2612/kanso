import { CassetteTape, Disc, Disc3, HardDrive, Library } from "lucide-react";
import type { CollectionFormat } from "@/types/collection";
import type { OptionItem } from "./types";

type BuildFormatOptionsOptions = {
  /** Incluye «toda la colección» al principio. */
  includeAll?: boolean;
  /** Incluye el formato digital (no aplica a la recomendación rápida). */
  includeDigital?: boolean;
};

/**
 * Opciones de formato con icono. El texto sigue siendo el nombre accesible;
 * el SVG es decorativo.
 */
export function buildFormatOptions(
  t: (key: string) => string,
  { includeAll = true, includeDigital = true }: BuildFormatOptionsOptions = {},
): OptionItem[] {
  const items: OptionItem[] = [];

  if (includeAll) {
    items.push({
      key: "all",
      label: t("all"),
      icon: <Library size={16} aria-hidden="true" />,
    });
  }
  if (includeDigital) {
    items.push({
      key: "digital",
      label: t("digital"),
      icon: <HardDrive size={16} aria-hidden="true" />,
    });
  }

  items.push(
    {
      key: "vinyl",
      label: t("vinyl"),
      icon: <Disc3 size={16} aria-hidden="true" />,
    },
    {
      key: "cd",
      label: t("cd"),
      icon: <Disc size={16} aria-hidden="true" />,
    },
    {
      key: "cassette",
      label: t("cassette"),
      icon: <CassetteTape size={16} aria-hidden="true" />,
    },
  );

  return items;
}

export type FormatOptionKey =
  | "all"
  | Extract<CollectionFormat, "digital" | "vinyl" | "cd" | "cassette">;
