"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Frontera de error global: sustituye al layout raíz, así que no puede depender
// de las clases del tema. Estilos en línea a propósito.
export default function GlobalError({
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
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0d0f0e",
          color: "#f3f5f3",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#2c7a45",
              fontWeight: 700,
            }}
          >
            Algo ha fallado
          </p>
          <h1
            style={{
              margin: ".75rem 0 0",
              fontSize: "1.75rem",
              fontWeight: 600,
            }}
          >
            La aplicación se ha encontrado con un error
          </h1>
          <p style={{ marginTop: "1rem", color: "#9aa39d", lineHeight: 1.6 }}>
            Ya se ha registrado para que podamos revisarlo. Puedes intentar
            recargar la página.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.75rem",
              border: "none",
              borderRadius: "0.75rem",
              padding: ".85rem 1.4rem",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              background: "#2c7a45",
              color: "#0d0f0e",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
