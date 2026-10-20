import type { ReactNode } from "react";

export type MedallionSize = "sm" | "md" | "lg";

type MedallionProps = {
  /** Emoji del catálogo que ocupa el medallón. */
  emoji: string;
  size?: MedallionSize;
  /** Relleno de acento: comunica "elegida" sin depender solo de la forma. */
  selected?: boolean;
  /** Marca superpuesta (por ejemplo, el check de la selección). Decorativa. */
  badge?: ReactNode;
  /** Variante de color cuando el medallón vive sobre un fondo de acento. */
  onAccent?: boolean;
  className?: string;
};

/**
 * Marca compartida de emociones y actividades: el emoji del catálogo dentro de
 * un contenedor construido con los tokens del tema.
 *
 * Es la misma pieza en el carrusel del inicio, en el filtro de la colección y en
 * el modal de guardar álbum, de modo que una emoción se reconozca igual en toda
 * la app. Es puramente decorativa (`aria-hidden`): el estado real lo comunica el
 * control que la envuelve, para no duplicar el nombre accesible.
 */
const Medallion = ({
  emoji,
  size = "md",
  selected = false,
  badge,
  onAccent = false,
  className = "",
}: MedallionProps) => {
  const classes = [
    "medallion",
    `medallion--${size}`,
    onAccent ? "medallion--on-accent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      data-selected={selected || undefined}
      aria-hidden="true"
    >
      <span className="medallion__emoji">{emoji}</span>
      {badge ? <span className="medallion__badge">{badge}</span> : null}
    </span>
  );
};

export default Medallion;
