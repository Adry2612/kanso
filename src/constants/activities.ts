export const activityOptions = [
  { id: "working", icon: "▣", emoji: "💼" },
  { id: "studying", icon: "▤", emoji: "📚" },
  { id: "exercising", icon: "↗", emoji: "🏃" },
  { id: "cooking", icon: "⌁", emoji: "🍳" },
  { id: "relaxing", icon: "☾", emoji: "😌" },
  { id: "gaming", icon: "◈", emoji: "🎮" },
  { id: "commuting", icon: "→", emoji: "🚌" },
  { id: "chores", icon: "＋", emoji: "🧹" },
  { id: "party", icon: "♪", emoji: "🎉" },
] as const;

/** Resuelve una actividad guardada a su entrada canónica del catálogo. */
export function getActivity(id: unknown) {
  if (typeof id !== "string") return undefined;
  return activityOptions.find((activity) => activity.id === id);
}
