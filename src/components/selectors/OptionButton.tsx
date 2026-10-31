"use client";

import type { FocusEventHandler, KeyboardEventHandler, Ref } from "react";
import { FaCheck } from "react-icons/fa";
import Medallion from "@/components/Medallion";
import type { OptionItem, OptionPresentation } from "./types";

type OptionButtonProps = {
  item: OptionItem;
  selected: boolean;
  active?: boolean;
  presentation?: OptionPresentation;
  onClick: () => void;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  tabIndex?: number;
  buttonRef?: Ref<HTMLButtonElement>;
  role?: "option" | "radio";
  ariaSelected?: boolean;
  ariaChecked?: boolean;
  ariaPressed?: boolean;
  className?: string;
};

/**
 * Botón único del sistema de selectores.
 *
 * El icono es decorativo; el nombre accesible es siempre la etiqueta. La
 * presentación `stacked` es la del carrusel de emociones (medallón grande) y
 * `tile` la de actividades y formatos (icono/medallón pequeño + texto).
 */
export default function OptionButton({
  item,
  selected,
  active = false,
  presentation = "tile",
  onClick,
  onFocus,
  onKeyDown,
  tabIndex,
  buttonRef,
  role,
  ariaSelected,
  ariaChecked,
  ariaPressed,
  className = "",
}: OptionButtonProps) {
  const stacked = presentation === "stacked";

  return (
    <button
      ref={buttonRef}
      type="button"
      role={role}
      aria-selected={ariaSelected}
      aria-checked={ariaChecked}
      aria-pressed={ariaPressed}
      data-selected={selected || undefined}
      data-active={active || undefined}
      data-presentation={presentation}
      disabled={item.disabled}
      tabIndex={tabIndex}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      className={`option-selector__option option-selector__option--${presentation} ${className}`.trim()}
    >
      {item.emoji ? (
        <Medallion
          emoji={item.emoji}
          size={stacked ? "lg" : "sm"}
          selected={selected}
          onAccent={!stacked && selected}
          badge={stacked && selected ? <FaCheck /> : undefined}
        />
      ) : item.icon ? (
        <span className="option-selector__icon" aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className="option-selector__label">{item.label}</span>
    </button>
  );
}
