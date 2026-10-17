export const moodOptions = [
  { key: "joy", label: "Alegría", emoji: "😄", symbol: "✦" },
  { key: "sadness", label: "Tristeza", emoji: "😢", symbol: "◒" },
  { key: "energy", label: "Energía", emoji: "⚡", symbol: "↗" },
  { key: "calm", label: "Calma", emoji: "🧘‍♂️", symbol: "⌁" },
  { key: "melancholy", label: "Melancolía", emoji: "😔", symbol: "◌" },
  { key: "ecstasy", label: "Éxtasis", emoji: "✨", symbol: "✺" },
  { key: "nostalgia", label: "Nostalgia", emoji: "🫧", symbol: "◍" },
  { key: "anger", label: "Enfado", emoji: "😠", symbol: "▲" },
  { key: "inspiration", label: "Inspiración", emoji: "💡", symbol: "◇" },
  { key: "love", label: "Amor", emoji: "❤️", symbol: "♡" },
  { key: "relaxation", label: "Relajación", emoji: "🌿", symbol: "∿" },
  { key: "anxiety", label: "Ansiedad", emoji: "🌀", symbol: "◎" },
  { key: "triumph", label: "Triunfo", emoji: "🏆", symbol: "★" },
  { key: "sleep", label: "Sueño", emoji: "🌙", symbol: "☾" },
  { key: "challenge", label: "Desafío", emoji: "⛰️", symbol: "△" },
] as const;

export type MoodKey = (typeof moodOptions)[number]["key"];

const aliases: Record<string, MoodKey> = {
  alegria: "joy",
  alegría: "joy",
  happy: "joy",
  feliz: "joy",
  tristeza: "sadness",
  sad: "sadness",
  triste: "sadness",
  energia: "energy",
  energía: "energy",
  energetic: "energy",
  energetico: "energy",
  energético: "energy",
  calma: "calm",
  calm: "calm",
  tranquilo: "calm",
  melancolia: "melancholy",
  melancolía: "melancholy",
  extasis: "ecstasy",
  éxtasis: "ecstasy",
  nostalgia: "nostalgia",
  enfado: "anger",
  anger: "anger",
  inspiracion: "inspiration",
  inspiración: "inspiration",
  inspired: "inspiration",
  amor: "love",
  love: "love",
  romantic: "love",
  romantico: "love",
  romántico: "love",
  relajacion: "relaxation",
  relajación: "relaxation",
  relaxing: "relaxation",
  relaxed: "relaxation",
  ansiedad: "anxiety",
  anxious: "anxiety",
  triunfo: "triumph",
  sueño: "sleep",
  desafio: "challenge",
  desafío: "challenge",
};

export function normalizeMood(value: unknown): MoodKey | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLocaleLowerCase("es");
  return (
    moodOptions.find((mood) => mood.key === normalized)?.key ??
    aliases[normalized] ??
    null
  );
}

export function normalizeMoods(values: unknown[]): MoodKey[] {
  return [
    ...new Set(
      values
        .map(normalizeMood)
        .filter((mood): mood is MoodKey => Boolean(mood)),
    ),
  ];
}

export function getMood(key: unknown) {
  const normalized = normalizeMood(key);
  return normalized
    ? moodOptions.find((mood) => mood.key === normalized)
    : undefined;
}

/**
 * Familias para presentar las emociones agrupadas en el selector. No cambia el
 * catálogo ni las claves: solo agrupa las que ya existen. Cada emoción aparece
 * en una única familia.
 */
export type MoodFamilyId = "energy" | "calm" | "warmth" | "melancholy";

export const moodFamilies: { id: MoodFamilyId; keys: MoodKey[] }[] = [
  {
    id: "energy",
    keys: ["energy", "ecstasy", "triumph", "challenge", "anger"],
  },
  { id: "calm", keys: ["calm", "relaxation", "sleep"] },
  { id: "warmth", keys: ["joy", "love", "inspiration", "nostalgia"] },
  { id: "melancholy", keys: ["sadness", "melancholy", "anxiety"] },
];
