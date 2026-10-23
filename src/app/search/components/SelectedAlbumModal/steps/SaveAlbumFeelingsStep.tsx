"use client";

import MoodSelector from "@/components/MoodSelector";
import type { Mood } from "@/types/mood";

interface SaveAlbumFeelingsStepProps {
  feelings: Mood[];
  onFeelingsChange: (moods: Mood[]) => void;
}

/** Paso 1: emociones asociadas al álbum. */
export function SaveAlbumFeelingsStep({
  feelings,
  onFeelingsChange,
}: SaveAlbumFeelingsStepProps) {
  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        Paso 1
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
        ¿Qué te hace sentir?
      </h3>
      <p className="album-action-modal-muted mt-2 text-sm">
        Selecciona una o varias emociones para recordar por qué guardas este
        disco.
      </p>
      <div className="mt-5">
        <MoodSelector
          variant="carousel"
          selectedMoods={feelings}
          onChange={onFeelingsChange}
        />
      </div>
      <p className="album-action-modal-muted mt-3 text-xs">
        {feelings.length
          ? `${feelings.length} ${feelings.length === 1 ? "sensación" : "sensaciones"} seleccionada${feelings.length === 1 ? "" : "s"}`
          : "Puedes continuar sin seleccionar ninguna."}
      </p>
    </section>
  );
}
