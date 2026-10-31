import { Search } from "lucide-react";

type CollectionSearchProps = {
  query: string;
  placeholder: string;
  clearLabel: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
};

export default function CollectionSearch({
  query,
  placeholder,
  clearLabel,
  onChange,
  onClear,
  className = "mb-6",
}: CollectionSearchProps) {
  return (
    <section className={className} aria-label={placeholder}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kanso-muted)]"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="kanso-input w-full py-2.5 pl-10 pr-10 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={onClear}
            aria-label={clearLabel}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--kanso-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        )}
      </div>
    </section>
  );
}
