"use client";

import React, { useState, useEffect } from "react";
import { moodOptions, normalizeMood } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";
import Medallion from "@/components/Medallion";

type MoodOption = {
  /** Clave canónica de la emoción (es lo que se guarda). */
  label: string;
  /** Etiqueta ya traducida, para mostrar. */
  displayLabel: string;
  emoji: string;
  symbol: string;
};

type MoodSelectorProps = {
  onChange?: (moods: MoodOption[]) => void;
  initialSelectedMoods?: MoodOption[];
};

/**
 * Selector de emociones en rejilla, sin carrusel: todas las emociones a la vez
 * (la spec lo exige para el modal y el filtro). Comparte la marca —el medallón—
 * con el carrusel del inicio para que una emoción se reconozca igual en la app.
 */
const MoodSelector = ({
  onChange,
  initialSelectedMoods = [],
}: MoodSelectorProps) => {
  const tMoods = useTranslations("moods");
  const allMoods: MoodOption[] = moodOptions.map((mood) => ({
    label: mood.key,
    displayLabel: tMoods(mood.key),
    emoji: mood.emoji,
    symbol: mood.symbol,
  }));
  const [selectedMoods, setSelectedMoods] = useState<MoodOption[]>(() =>
    initialSelectedMoods
      .map((mood) => {
        const key = normalizeMood(mood.label);
        return key ? allMoods.find((item) => item.label === key) : undefined;
      })
      .filter((mood): mood is MoodOption => Boolean(mood)),
  );

  useEffect(() => {
    if (onChange) onChange(selectedMoods);
  }, [selectedMoods, onChange]);

  const toggleMood = (mood: MoodOption) => {
    setSelectedMoods((prev) =>
      prev.find((item) => item.label === mood.label)
        ? prev.filter((item) => item.label !== mood.label)
        : [...prev, mood],
    );
  };

  return (
    <div
      role="group"
      aria-label="Selector de emociones"
      className="grid grid-cols-2 gap-2 p-1 sm:grid-cols-3"
    >
      {allMoods.map((mood) => {
        const isSelected = selectedMoods.some(
          (item) => item.label === mood.label,
        );
        return (
          <button
            key={mood.label}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleMood(mood)}
            className={`flex items-center gap-3 rounded-[var(--radius-sm)] border px-3 py-2.5 text-left text-xs font-semibold transition ${
              isSelected
                ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                : "border-[var(--kanso-line)] bg-[var(--surface-1)]/50 text-[var(--foreground)] hover:border-[var(--kanso-mint)]/60"
            }`}
          >
            <Medallion emoji={mood.emoji} size="sm" onAccent={isSelected} />
            <span>{mood.displayLabel}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MoodSelector;
