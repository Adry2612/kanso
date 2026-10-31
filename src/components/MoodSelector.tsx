"use client";

import React, { useState } from "react";
import { moodOptions, normalizeMood } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";
import OptionSelector from "@/components/selectors/OptionSelector";
import type { OptionItem } from "@/components/selectors/types";
import type { Mood } from "@/types/mood";

type MoodOption = Mood & {
  /** Etiqueta ya traducida, para mostrar. */
  displayLabel: string;
};

type MoodSelectorProps = {
  onChange?: (moods: Mood[]) => void;
  initialSelectedMoods?: Mood[];
  /** Si se pasa, el selector es controlado y refleja siempre esta selección. */
  selectedMoods?: Mood[];
  variant?: "grid" | "carousel";
};

/**
 * Selector de emociones. Usa el mismo botón y carril compartidos que el resto
 * de selectores; en el modal se muestra como carrusel para que el paso no sea
 * una pared de opciones.
 */
const MoodSelector = ({
  onChange,
  initialSelectedMoods = [],
  selectedMoods,
  variant = "grid",
}: MoodSelectorProps) => {
  const tMoods = useTranslations("moods");
  const allMoods: MoodOption[] = moodOptions.map((mood) => ({
    label: mood.key,
    displayLabel: tMoods(mood.key),
    emoji: mood.emoji,
    symbol: mood.symbol,
  }));

  const normalizeSelection = (moods: Mood[]) =>
    moods
      .map((mood) => {
        const key = normalizeMood(mood.label);
        return key ? allMoods.find((item) => item.label === key) : undefined;
      })
      .filter((mood): mood is MoodOption => Boolean(mood));

  const [internalSelected, setInternalSelected] = useState<MoodOption[]>(() =>
    normalizeSelection(initialSelectedMoods),
  );
  const isControlled = selectedMoods !== undefined;
  const selected = isControlled
    ? normalizeSelection(selectedMoods)
    : internalSelected;

  const toggleMood = (mood: MoodOption) => {
    const next = selected.some((item) => item.label === mood.label)
      ? selected.filter((item) => item.label !== mood.label)
      : [...selected, mood];
    if (!isControlled) setInternalSelected(next);
    onChange?.(next);
  };

  const options: OptionItem[] = allMoods.map((mood) => ({
    key: mood.label,
    label: mood.displayLabel,
    emoji: mood.emoji,
  }));

  const handleSelect = (key: string) => {
    const mood = allMoods.find((item) => item.label === key);
    if (mood) toggleMood(mood);
  };

  return (
    <OptionSelector
      options={options}
      selectedKeys={selected.map((mood) => mood.label)}
      onSelect={handleSelect}
      selection="multiple"
      layout={variant}
      semantics="buttons"
      ariaLabel="Selector de emociones"
      className={variant === "carousel" ? "option-selector--mood" : undefined}
      columns={variant === "grid" ? 3 : undefined}
      buttonClassName={
        variant === "carousel" ? "save-album-modal-option" : undefined
      }
    />
  );
};

export default MoodSelector;
