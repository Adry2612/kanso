"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";

type OptionCarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
};

/**
 * Carril horizontal reutilizable para elegir emociones o actividades sin
 * convertir el modal en una lista interminable. En táctil se desliza; con
 * ratón quedan las flechas bajo el carril.
 */
export default function OptionCarousel({
  children,
  ariaLabel,
  className = "",
}: OptionCarouselProps) {
  const t = useTranslations("common");
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(
      rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateControls();
    const rail = railRef.current;
    if (!rail) return;

    rail.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      rail.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [updateControls]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 180),
      behavior: "smooth",
    });
  };

  return (
    <div className={`option-carousel ${className}`.trim()}>
      <div
        ref={railRef}
        className="option-carousel__rail"
        role="group"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      {(canScrollLeft || canScrollRight) && (
        <div className="option-carousel__controls">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label={t("previous")}
            className="option-carousel__control"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label={t("next")}
            className="option-carousel__control"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
