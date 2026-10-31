import type { ReactNode } from "react";

type CollectionHeaderProps = {
  labels: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
  stats?: ReactNode;
};

export default function CollectionHeader({
  labels,
  stats,
}: CollectionHeaderProps) {
  return (
    <section className="max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
        {labels.eyebrow}
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
        {labels.title}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
        {labels.subtitle}
      </p>
      {stats}
    </section>
  );
}
