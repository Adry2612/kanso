"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import {
  getRecommendationFeedback,
  rateRecommendation,
} from "@/services/client/recommendations";

type RecommendationFeedbackProps = {
  albumId: string;
};

/**
 * Control para valorar la recomendación mostrada.
 *
 * Refleja la valoración guardada y permite cambiarla; cada pulsación sustituye
 * la anterior (no acumula). Los botones usan `aria-pressed` para exponer el
 * estado a las tecnologías de asistencia.
 */
export default function RecommendationFeedback({
  albumId,
}: RecommendationFeedbackProps) {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  // Evita que la lectura inicial pise una valoración hecha por la persona.
  const interactedForRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getRecommendationFeedback(albumId)
      .then((feedback) => {
        if (cancelled || interactedForRef.current === albumId) return;
        setLiked(feedback?.liked ?? null);
      })
      .catch(() => {
        if (!cancelled && interactedForRef.current !== albumId) setLiked(null);
      });

    return () => {
      cancelled = true;
    };
  }, [albumId]);

  const submit = async (value: boolean) => {
    if (saving) return;

    const previous = liked;
    interactedForRef.current = albumId;
    setSaving(true);
    setError(false);
    setLiked(value);

    try {
      await rateRecommendation(albumId, value);
    } catch {
      setLiked(previous);
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const buttonClass = (active: boolean) =>
    `inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
      active
        ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)]/15 text-[var(--kanso-mint)]"
        : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/60 hover:text-[var(--foreground)]"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-[var(--kanso-muted)]">
        ¿Te gustó esta recomendación?
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={saving}
          aria-pressed={liked === true}
          aria-label="Me gustó esta recomendación"
          className={buttonClass(liked === true)}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={saving}
          aria-pressed={liked === false}
          aria-label="No me gustó esta recomendación"
          className={buttonClass(liked === false)}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {error && (
        <span role="alert" className="text-xs text-[var(--kanso-danger)]">
          No se pudo guardar la valoración.
        </span>
      )}
    </div>
  );
}
