"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import ErrorState from "@/components/ErrorState";

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
    <main className="kanso-main min-h-screen">
      <ErrorState
        variant="page"
        className="mt-16"
        title="No pudimos cargar esta pantalla"
        description="El error ya se ha registrado. Puedes reintentar sin perder el resto de la aplicación."
        onRetry={reset}
        retryLabel="Reintentar"
      />
    </main>
  );
}
