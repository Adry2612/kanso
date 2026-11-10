const STEPS = ["Sensaciones", "Actividades", "Formato"];

interface SaveAlbumStepperProps {
  step: number;
}

/**
 * Progreso del asistente.
 *
 * En móvil solo se ven tres barras: las etiquetas repetían el «Paso N» que ya
 * aparece dentro del contenido y robaban altura al paso. Desde `sm` recuperan
 * el texto visible. Las etiquetas siguen en el árbol de accesibilidad.
 */
export function SaveAlbumStepper({ step }: SaveAlbumStepperProps) {
  return (
    <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Pasos">
      {STEPS.map((label, index) => (
        <li
          key={label}
          aria-current={index === step ? "step" : undefined}
          className="min-w-0"
        >
          <span
            aria-hidden="true"
            className={`block h-1 rounded-full transition ${
              index <= step
                ? "bg-[var(--kanso-mint)]"
                : "bg-[var(--kanso-line)]"
            }`}
          />
          <span
            className={`sr-only sm:not-sr-only sm:mt-2 sm:block sm:text-[10px] sm:font-bold sm:uppercase sm:tracking-[.12em] ${
              index <= step
                ? "sm:text-[var(--kanso-mint)]"
                : "sm:text-[var(--kanso-muted)]"
            }`}
          >
            <span className="mr-1">0{index + 1}</span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
