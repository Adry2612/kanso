"use client";

import type { ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";

type ErrorStateVariant = "panel" | "page" | "inline";

interface ErrorStateProps {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  variant?: ErrorStateVariant;
  className?: string;
}

/**
 * Lenguaje visual común para los fallos de carga.
 *
 * Antes cada pantalla resolvía el error con un párrafo rojo suelto; este
 * componente añade jerarquía, icono y una acción clara sin depender del texto
 * técnico que devuelve la API.
 */
export default function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  action,
  variant = "panel",
  className = "",
}: ErrorStateProps) {
  const t = useTranslations("common");
  const label = retryLabel ?? t("retry");

  if (variant === "inline") {
    return (
      <div
        role="alert"
        className={`flex flex-col gap-3 rounded-xl border border-[var(--kanso-danger)]/30 bg-[var(--kanso-danger)]/10 px-4 py-3.5 sm:flex-row sm:items-start ${className}`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--kanso-danger)]/15 text-[var(--kanso-danger)]">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--kanso-muted)]">
                {description}
              </p>
            )}
            {action && <div className="mt-2">{action}</div>}
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="self-start rounded-lg px-2 py-1 text-xs font-semibold text-[var(--kanso-danger)] underline-offset-2 transition hover:underline sm:shrink-0"
          >
            {label}
          </button>
        )}
      </div>
    );
  }

  return (
    <section
      role="alert"
      className={`mx-auto text-center ${
        variant === "page" ? "max-w-xl" : "max-w-2xl"
      } rounded-2xl border border-[var(--kanso-danger)]/25 bg-[var(--kanso-danger)]/[0.07] p-6 md:p-7 ${className}`}
    >
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--kanso-danger)]/30 bg-[var(--kanso-danger)]/10 text-[var(--kanso-danger)]">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[.18em] text-[var(--kanso-danger)]">
        {t("error")}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
          {description}
        </p>
      )}
      {(onRetry || action) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:brightness-105"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          )}
          {action}
        </div>
      )}
    </section>
  );
}
