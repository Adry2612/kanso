import { moodOptions } from "./moods";

// Compatibilidad para los componentes que aún consumen el nombre en español.
export const musicalFeelings = moodOptions.map((mood, index) => ({
  id: index + 1,
  nombre: mood.label,
  key: mood.key,
  emoji: mood.emoji,
  symbol: mood.symbol,
}));
