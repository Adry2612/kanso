"use client";

import { useMemo } from "react";
import OptionButton from "./OptionButton";
import OptionGrid from "./OptionGrid";
import OptionRail from "./OptionRail";
import type {
  OptionItem,
  OptionLayout,
  OptionSemantics,
  OptionSelection,
} from "./types";

type OptionSelectorProps = {
  options: OptionItem[];
  selectedKeys: readonly string[];
  onSelect: (key: string) => void;
  /** Selección múltiple (emociones, actividades, formatos) o única. */
  selection?: OptionSelection;
  /** Rejilla o carril horizontal. */
  layout?: OptionLayout;
  /** `listbox`/`radiogroup` o botones con `aria-pressed`. */
  semantics?: OptionSemantics;
  ariaLabel: string;
  className?: string;
  columns?: 2 | 3 | 4;
  /** Filtro opcional por etiqueta; el campo lo pinta quien lo use. */
  query?: string;
  /** Clases extra para cada botón (p. ej. el estilo del modal de guardado). */
  buttonClassName?: string;
};

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Selector compartido de emociones, actividades y formatos.
 *
 * No guarda estado de selección: recibe `selectedKeys` y notifica `onSelect`.
 * La presentación y los roles se conservan entre rejilla y carril.
 */
export default function OptionSelector({
  options,
  selectedKeys,
  onSelect,
  selection = "multiple",
  layout = "grid",
  semantics = "listbox",
  ariaLabel,
  className = "",
  columns = 4,
  query = "",
  buttonClassName,
}: OptionSelectorProps) {
  const selected = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const visible = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return options;
    return options.filter((option) => normalize(option.label).includes(needle));
  }, [options, query]);

  const isMultiple = selection === "multiple";
  const useButtons = semantics === "buttons";
  const role = useButtons ? "group" : isMultiple ? "listbox" : "radiogroup";

  const buttons = visible.map((option) => {
    const isSelected = selected.has(option.key);

    return (
      <OptionButton
        key={option.key}
        item={option}
        selected={isSelected}
        onClick={() => onSelect(option.key)}
        role={
          useButtons
            ? undefined
            : isMultiple
              ? ("option" as const)
              : ("radio" as const)
        }
        ariaPressed={useButtons ? isSelected : undefined}
        ariaSelected={!useButtons && isMultiple ? isSelected : undefined}
        ariaChecked={!useButtons && !isMultiple ? isSelected : undefined}
        className={buttonClassName}
      />
    );
  });

  const content =
    layout === "carousel" ? (
      <OptionRail
        ariaLabel={ariaLabel}
        role={role}
        ariaMultiselectable={isMultiple && !useButtons ? true : undefined}
      >
        <div className="option-selector__rail-track">
          {buttons.map((button, index) => (
            <div
              key={visible[index]?.key ?? index}
              className="option-selector__snap"
            >
              {button}
            </div>
          ))}
        </div>
      </OptionRail>
    ) : (
      <OptionGrid ariaLabel={ariaLabel} role={role} columns={columns}>
        {buttons}
      </OptionGrid>
    );

  return (
    <div
      className={`option-selector option-selector--${layout} ${className}`.trim()}
    >
      {content}
    </div>
  );
}
