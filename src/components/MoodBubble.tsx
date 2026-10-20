"use client";

import { MoodBubbleProps } from "@/types/mood";
import Medallion from "@/components/Medallion";
import { getMood, normalizeMood } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";

/**
 * Burbuja de una emoción ya elegida. Muestra la misma marca (medallón) que el
 * carrusel del inicio y resuelve siempre la etiqueta traducida, nunca la clave
 * interna.
 */
const MoodBubble = ({ mood }: MoodBubbleProps) => {
  const tMoods = useTranslations("moods");
  const key = normalizeMood(mood.label);
  const emoji = (key ? getMood(key)?.emoji : undefined) || mood.emoji || "🎵";
  const label = key ? tMoods(key) : mood.label;

  return (
    <span className="mood-bubble inline-flex items-center gap-2 rounded-full py-1 pl-1.5 pr-3.5 text-sm font-semibold transition">
      <Medallion emoji={emoji} size="sm" onAccent />
      <span>{label}</span>
    </span>
  );
};

export default MoodBubble;
