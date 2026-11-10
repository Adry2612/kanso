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
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:mt-3 sm:text-5xl">
        {labels.title}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)] sm:mt-4">
        {labels.subtitle}
      </p>
      {stats}
    </section>
  );
}
