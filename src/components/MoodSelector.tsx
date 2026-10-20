"use client";

import React, { useState } from "react";
import { moodOptions, normalizeMood } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";
import Medallion from "@/components/Medallion";
import OptionCarousel from "@/components/OptionCarousel";

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
  /** Si se pasa, el selector es controlado y refleja siempre esta selección. */
  selectedMoods?: MoodOption[];
  variant?: "grid" | "carousel";
};

/**
 * Selector de emociones. En el modal se muestra como carrusel para que el paso
 * no sea una pared de opciones; la rejilla queda disponible para contextos
 * donde convenga ver todas las emociones a la vez.
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

  const normalizeSelection = (moods: MoodOption[]) =>
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

  const options = allMoods.map((mood) => {
    const isSelected = selected.some((item) => item.label === mood.label);
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
  });

  if (variant === "carousel") {
    return (
      <OptionCarousel
        ariaLabel="Selector de emociones"
        className="mood-carousel"
      >
        {options}
      </OptionCarousel>
    );
  }

  return (
    <div
      role="group"
      aria-label="Selector de emociones"
      className="grid grid-cols-2 gap-2 p-1 sm:grid-cols-3"
    >
      {options}
    </div>
  );
};

export default MoodSelector;
