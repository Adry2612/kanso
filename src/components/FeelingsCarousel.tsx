"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import Medallion from "@/components/Medallion";
import {
  AnimatePresence,
  EASE_OUT,
  motion,
  Stagger,
  StaggerItem,
  useReducedMotion,
} from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";

export type CarouselOption = {
  /** Clave canónica de la emoción o la actividad. */
  key: string;
  /** Etiqueta ya traducida. */
  label: string;
  emoji: string;
};

type FeelingsCarouselProps = {
  options: CarouselOption[];
  /** "multiple" (emociones) alterna; "single" (actividades) elige una. */
  selection?: "multiple" | "single";
  selectedKeys: string[];
  onSelect: (key: string) => void;
  /** Nombre accesible del carrusel. */
  label: string;
  /**
   * Buscador controlado: la persona que lo usa pinta el botón de la lupa donde
   * le convenga y aquí solo se muestra el campo cuando `open` es `true`.
   */
  search?: { open: boolean; onOpenChange: (open: boolean) => void };
};

/**
 * Compara sin acentos ni mayúsculas: "relajacion" encuentra "Relajación".
 * La búsqueda es de presentación: no toca claves ni datos guardados.
 */
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/**
 * Carrusel de emociones y actividades.
 *
 * Carril horizontal con **todas** las opciones renderizadas (nada de páginas ni
 * código muerto): la opción activa se centra y crece, las vecinas asoman a los
 * lados. Se recorre con arrastre, rueda, las flechas del carril y el teclado
 * (flechas, Inicio/Fin). Nunca rota solo y se muestra estático con movimiento
 * reducido.
 *
 * Las flechas viven centradas bajo el carril, para no tapar las opciones de los
 * extremos. El buscador filtra por texto sin perder la selección.
 */
const FeelingsCarousel = ({
  options,
  selection = "multiple",
  selectedKeys,
  onSelect,
  label,
  search,
}: FeelingsCarouselProps) => {
  const reduce = useReducedMotion();
  const t = useTranslations("feelingsCarousel");
  const hintId = useId();
  const railRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeRef = useRef(0);
  const userScrollRef = useRef(false);
  const scrollIdleRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");

  const searchOpen = Boolean(search?.open);
  const selected = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const isMultiple = selection === "multiple";
  const containerRole = isMultiple ? "listbox" : "radiogroup";
  const itemRole = isMultiple ? "option" : "radio";

  // Lo que se pinta: todo el catálogo o solo lo que coincide con la búsqueda.
  const visible = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return options;
    return options.filter((option) => normalize(option.label).includes(needle));
  }, [options, query]);

  const centerOption = useCallback(
    (index: number) => {
      const node = optionRefs.current[index];
      if (!node?.scrollIntoView) return;
      node.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [reduce],
  );

  /** Mueve el foco (y en modo simple la selección) sin salirse de los extremos. */
  const focusOption = useCallback(
    (index: number, selectIfSingle = true) => {
      const count = visible.length;
      if (count === 0) return;
      const next = Math.max(0, Math.min(count - 1, index));
      if (next === activeRef.current) return;
      // Un movimiento explícito manda: que el scroll que provoca el foco no
      // devuelva la activa al elemento centrado.
      userScrollRef.current = false;
      activeRef.current = next;
      setActiveIndex(next);
      centerOption(next);
      optionRefs.current[next]?.focus({ preventScroll: true });
      if (!isMultiple && selectIfSingle) onSelect(visible[next].key);
    },
    [visible, isMultiple, onSelect, centerOption],
  );

  // El carril sigue al scroll solo cuando lo provoca la persona (arrastre,
  // rueda o touch): así el foco por teclado no lo sobrescribe al llegar a los
  // extremos, donde un elemento no puede quedar perfectamente centrado.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let frame = 0;

    const syncActive = () => {
      frame = 0;
      const railRect = rail.getBoundingClientRect();
      const center = railRect.left + railRect.width / 2;
      let nearest = activeRef.current;
      let nearestDistance = Number.POSITIVE_INFINITY;

      optionRefs.current.forEach((node, index) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = index;
        }
      });

      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActiveIndex(nearest);
      }
    };

    const handleScroll = () => {
      if (!userScrollRef.current) return;
      if (!frame) frame = window.requestAnimationFrame(syncActive);
      if (scrollIdleRef.current) window.clearTimeout(scrollIdleRef.current);
      scrollIdleRef.current = window.setTimeout(() => {
        userScrollRef.current = false;
      }, 160);
    };

    const markUserScroll = () => {
      userScrollRef.current = true;
    };

    rail.addEventListener("scroll", handleScroll, { passive: true });
    rail.addEventListener("wheel", markUserScroll, { passive: true });
    rail.addEventListener("touchstart", markUserScroll, { passive: true });
    rail.addEventListener("pointerdown", markUserScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", handleScroll);
      rail.removeEventListener("wheel", markUserScroll);
      rail.removeEventListener("touchstart", markUserScroll);
      rail.removeEventListener("pointerdown", markUserScroll);
      if (frame) window.cancelAnimationFrame(frame);
      if (scrollIdleRef.current) window.clearTimeout(scrollIdleRef.current);
    };
  }, [visible.length, searchOpen]);

  // Si el filtro reduce la lista, la activa no puede quedar fuera de rango.
  useEffect(() => {
    if (visible.length === 0 || activeIndex <= visible.length - 1) return;
    const next = visible.length - 1;
    activeRef.current = next;
    setActiveIndex(next);
  }, [visible.length, activeIndex]);

  // Al abrir el buscador el foco entra en el campo; al cerrarlo se limpia.
  useEffect(() => {
    if (searchOpen) {
      const frame = window.requestAnimationFrame(() =>
        inputRef.current?.focus(),
      );
      return () => window.cancelAnimationFrame(frame);
    }
    setQuery("");
  }, [searchOpen]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // El filtro reinicia el recorrido: la primera coincidencia pasa a la activa
    // y el carril vuelve al principio para que quede a la vista.
    activeRef.current = 0;
    setActiveIndex(0);
    optionRefs.current = [];
    if (railRef.current) railRef.current.scrollLeft = 0;
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusOption(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusOption(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(visible.length - 1);
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        onSelect(visible[index].key);
        break;
      default:
        break;
    }
  };

  const resultLabel =
    visible.length === 1
      ? `${visible.length} ${t("resultOne")}`
      : `${visible.length} ${t("results")}`;

  return (
    <div className="feelings-carousel">
      {search && (
        <AnimatePresence initial={false}>
          {searchOpen && (
            <motion.div
              key="feelings-search"
              id="feelings-search"
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }
              }
              animate={
                reduce ? { opacity: 1 } : { opacity: 1, height: "auto", y: 0 }
              }
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="overflow-hidden"
            >
              <div className="feelings-carousel__search">
                <FaSearch
                  aria-hidden="true"
                  className="feelings-carousel__search-icon"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Escape") return;
                    event.preventDefault();
                    if (query) handleQueryChange("");
                    else search.onOpenChange(false);
                  }}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("search")}
                  autoComplete="off"
                  spellCheck={false}
                  className="feelings-carousel__input"
                />
                {query && (
                  <>
                    <span
                      aria-hidden="true"
                      className="feelings-carousel__count"
                    >
                      {visible.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQueryChange("")}
                      aria-label={t("clear")}
                      className="feelings-carousel__clear"
                    >
                      <FaTimes aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {visible.length > 0 ? (
        <div
          ref={railRef}
          className="feelings-rail"
          role={containerRole}
          aria-label={label}
          aria-describedby={hintId}
          aria-multiselectable={isMultiple || undefined}
        >
          <Stagger className="feelings-rail__track" stagger={0.045} onMount>
            {visible.map((option, index) => {
              const isSelected = selected.has(option.key);
              const isActive = index === activeIndex;
              return (
                <StaggerItem key={option.key} className="feelings-rail__snap">
                  <button
                    type="button"
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    role={itemRole}
                    aria-selected={isMultiple ? isSelected : undefined}
                    aria-checked={isMultiple ? undefined : isSelected}
                    tabIndex={isActive ? 0 : -1}
                    data-active={isActive || undefined}
                    data-selected={isSelected || undefined}
                    onClick={() => onSelect(option.key)}
                    onFocus={() => {
                      userScrollRef.current = false;
                      if (index !== activeRef.current) {
                        activeRef.current = index;
                        setActiveIndex(index);
                      }
                    }}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    className="feeling-option"
                  >
                    <Medallion
                      emoji={option.emoji}
                      size="lg"
                      selected={isSelected}
                      badge={isSelected ? <FaCheck /> : undefined}
                    />
                    <span className="feeling-option__label">
                      {option.label}
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      ) : (
        <p role="status" className="feelings-carousel__empty">
          {t("noResults")}
        </p>
      )}

      <div className="feelings-carousel__footer">
        <div className="feelings-carousel__nav">
          <button
            type="button"
            onClick={() => focusOption(activeIndex - 1)}
            disabled={visible.length === 0 || activeIndex === 0}
            aria-label={t("previous")}
            className="feelings-carousel__control"
          >
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => focusOption(activeIndex + 1)}
            disabled={
              visible.length === 0 || activeIndex === visible.length - 1
            }
            aria-label={t("next")}
            className="feelings-carousel__control"
          >
            <FaChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {query ? resultLabel : ""}
      </p>

      <p id={hintId} className="sr-only">
        {t("hint")}
      </p>
    </div>
  );
};

export default FeelingsCarousel;
