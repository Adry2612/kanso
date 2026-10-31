import InlineEmoji from "@/components/InlineEmoji";

export type MoodChip = {
  key: string;
  label: string;
  emoji?: string;
};

type CollectionMoodChipsProps = {
  moods: MoodChip[];
  selected: string[];
  allLabel: string;
  onClear: () => void;
  onToggle: (mood: string) => void;
};

export default function CollectionMoodChips({
  moods,
  selected,
  allLabel,
  onClear,
  onToggle,
}: CollectionMoodChipsProps) {
  if (moods.length === 0) return null;

  return (
    <div className="mt-6 mb-4 flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selected.length === 0}
        onClick={onClear}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          selected.length === 0
            ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
            : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
        }`}
      >
        {allLabel}
      </button>
      {moods.map((mood) => {
        const active = selected.includes(mood.key);
        return (
          <button
            key={mood.key}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(mood.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
            }`}
          >
            <InlineEmoji emoji={mood.emoji} />
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
