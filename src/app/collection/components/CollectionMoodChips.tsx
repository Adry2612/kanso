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
    <div className="relative -mx-[var(--page-gutter)] mt-4 mb-3 sm:mx-0 sm:mt-6 sm:mb-4">
      <div className="mood-chip-rail flex snap-x scroll-pl-[var(--page-gutter)] gap-2 overflow-x-auto px-[var(--page-gutter)] py-2 sm:flex-wrap sm:overflow-visible sm:scroll-pl-0 sm:px-0">
        <button
          type="button"
          aria-pressed={selected.length === 0}
          onClick={onClear}
          className={`shrink-0 snap-start rounded-full border px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
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
              className={`shrink-0 snap-start rounded-full border px-2.5 py-1.5 text-xs font-semibold transition sm:px-3 ${
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[var(--background)] to-transparent sm:hidden"
      />
    </div>
  );
}
