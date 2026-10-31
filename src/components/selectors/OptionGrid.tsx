"use client";

import type { ReactNode } from "react";

type OptionGridProps = {
  children: ReactNode;
  ariaLabel: string;
  role?: string;
  className?: string;
  columns?: 2 | 3 | 4;
};

/** Rejilla compartida de opciones (2 columnas en móvil). */
export default function OptionGrid({
  children,
  ariaLabel,
  role = "group",
  className = "",
  columns = 4,
}: OptionGridProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={`option-selector__grid option-selector__grid--${columns} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
