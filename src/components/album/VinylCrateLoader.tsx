"use client";

import { motion, useReducedMotion } from "@/components/motion";

/** Número de portadas de la pila. */
const COVERS = 5;

/** Ángulo y desplazamiento base de cada portada dentro del abanico. */
const ANGLES = [-15, -7.5, 0, 7.5, 15];
const OFFSETS = [-30, -15, 0, 15, 30];

type VinylCrateLoaderProps = {
  /** Tamaño y radio del contenedor; suele aportar el hueco de la portada. */
  className?: string;
  /** `framed` conserva el marco de portada; `bare` lo quita para centrarlo. */
  variant?: "framed" | "bare";
};

/**
 * Pila de portadas para la carga de una recomendación.
 *
 * Dibuja varias portadas cuadradas abiertas en abanico y adelanta una tras otra
 * en ciclo, como si se sacara un disco de la pila para mirarlo. Es decorativo:
 * el estado de carga lo anuncia el contenedor que lo envuelve. Con movimiento
 * reducido la pila queda quieta.
 */
export default function VinylCrateLoader({
  className,
  variant = "framed",
}: VinylCrateLoaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`vinyl-fan ${variant === "bare" ? "vinyl-fan--bare" : ""} ${className ?? ""}`.trim()}
      aria-hidden="true"
    >
      <div className="vinyl-fan-stack">
        {Array.from({ length: COVERS }).map((_, index) => {
          const angle = ANGLES[index] ?? 0;
          const offset = OFFSETS[index] ?? 0;

          return (
            <motion.span
              key={index}
              className="vinyl-fan-cover"
              style={{ x: offset, rotate: angle }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      y: [0, -18, 0],
                      rotate: [angle, angle * 0.3, angle],
                      scale: [1, 1.06, 1],
                      zIndex: [1, 20, 1],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 2.6,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 0.2,
                      delay: index * 0.2,
                    }
              }
            >
              <span className="vinyl-fan-disc" />
            </motion.span>
          );
        })}
      </div>
    </div>
  );
}
