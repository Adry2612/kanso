type CollectionEmptyStateProps = {
  variant:
    | "collection"
    | "collection-filtered"
    | "listen-later"
    | "listen-later-filtered";
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
};

const icons = {
  collection: "◇",
  "collection-filtered": "◇",
  "listen-later": "◷",
  "listen-later-filtered": "◷",
} as const;

export default function CollectionEmptyState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
}: CollectionEmptyStateProps) {
  const filtered = variant.endsWith("filtered");
  return (
    <div className="mt-8 grid min-h-[34vh] w-full place-items-center py-4 sm:mt-10">
      <section
        className={`w-full max-w-xl rounded-2xl p-7 text-center ${
          filtered
            ? "border border-dashed border-[var(--kanso-line)]"
            : "border border-[var(--kanso-line)] bg-[var(--surface-1)]/45"
        }`}
      >
        {!filtered && (
          <span className="text-3xl text-[var(--kanso-mint)]">
            {icons[variant]}
          </span>
        )}
        <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
          {description}
        </p>
        <button
          type="button"
          onClick={onAction}
          className={`mt-5 rounded-xl px-4 text-sm font-semibold ${
            filtered
              ? "border border-[var(--kanso-line)] py-2.5 text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/50"
              : "bg-[var(--kanso-mint)] py-3 text-[var(--background)]"
          }`}
        >
          {actionLabel}
        </button>
      </section>
    </div>
  );
}
