const STEPS = ["Sensaciones", "Actividades", "Formato"];

interface SaveAlbumStepperProps {
  step: number;
}

/** Cabecera de pasos del asistente de guardado. */
export function SaveAlbumStepper({ step }: SaveAlbumStepperProps) {
  return (
    <ol
      className="mt-5 grid grid-cols-3 gap-2 border-[var(--kanso-line)] pt-4"
      aria-label="Pasos"
    >
      {STEPS.map((label, index) => (
        <li
          key={label}
          aria-current={index === step ? "step" : undefined}
          className={`pb-4 pt-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${
            index <= step
              ? "border-t-2 border-[var(--kanso-mint)] text-[var(--kanso-mint)]"
              : "border-t-2 border-[var(--kanso-line)] text-[var(--kanso-muted)]"
          }`}
        >
          <span className="mr-1">0{index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
