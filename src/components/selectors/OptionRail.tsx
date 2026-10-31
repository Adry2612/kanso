"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";

/**
 * Centra un elemento dentro del carril sin pasarse del scroll máximo.
 *
 * `scrollIntoView({ inline: "center" })` deja el último elemento a merced del
 * clamp del navegador; calcular el destino y limitarlo a
 * `scrollWidth - clientWidth` garantiza que el final se vea completo.
 */
export function centerRailItem(
  rail: HTMLElement | null,
  item: HTMLElement | null,
  behavior: ScrollBehavior,
): void {
  if (!rail || !item) return;

  const railRect = rail.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const target =
    rail.scrollLeft +
    (itemRect.left - railRect.left) -
    (railRect.width - itemRect.width) / 2;
  const max = rail.scrollWidth - rail.clientWidth;

  rail.scrollTo({
    left: Math.max(0, Math.min(target, max)),
    behavior,
  });
}

type OptionRailProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  role?: string;
  ariaMultiselectable?: boolean;
  ariaDescribedBy?: string;
  railRef?: RefObject<HTMLDivElement | null>;
  showControls?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
};

/**
 * Carril horizontal compartido. El llamador decide la pista (un `div` o un
 * `Stagger`) y este componente aporta scroll, flechas, snap y extremos.
 */
export default function OptionRail({
  children,
  ariaLabel,
  className = "",
  role,
  ariaMultiselectable,
  ariaDescribedBy,
  railRef,
  showControls = true,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
}: OptionRailProps) {
  const t = useTranslations("common");
  const reduce = useReducedMotion();
  const internalRef = useRef<HTMLDivElement>(null);
  const rail = railRef ?? internalRef;
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateControls = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    setCanScrollLeft(node.scrollLeft > 4);
    setCanScrollRight(
      node.scrollLeft + node.clientWidth < node.scrollWidth - 4,
    );
  }, [rail]);

  useEffect(() => {
    updateControls();
    const node = rail.current;
    if (!node) return;

    node.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      node.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [rail, updateControls]);

  const scroll = (direction: -1 | 1) => {
    const node = rail.current;
    if (!node) return;
    node.scrollBy({
      left: direction * Math.max(node.clientWidth * 0.8, 180),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const isPrevDisabled = previousDisabled ?? !canScrollLeft;
  const isNextDisabled = nextDisabled ?? !canScrollRight;

  return (
    <div className={`option-selector__rail-wrap ${className}`.trim()}>
      <div
        ref={rail}
        className="option-selector__rail"
        role={role}
        aria-label={ariaLabel}
        aria-multiselectable={ariaMultiselectable || undefined}
        aria-describedby={ariaDescribedBy}
      >
        {children}
      </div>
      {showControls && (
        <div className="option-selector__controls">
          <button
            type="button"
            onClick={onPrevious ?? (() => scroll(-1))}
            disabled={isPrevDisabled}
            aria-label={t("previous")}
            className="option-selector__control"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext ?? (() => scroll(1))}
            disabled={isNextDisabled}
            aria-label={t("next")}
            className="option-selector__control"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
