"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="kanso-main min-h-screen" role="alert">
      <div className="pt-16">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
          Algo ha fallado
        </p>
        <h1 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          No pudimos cargar esta pantalla
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
          El error ya se ha registrado. Puedes reintentar sin perder el resto de
          la aplicación.
        </p>
        <button
          onClick={() => reset()}
          className="mt-7 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
