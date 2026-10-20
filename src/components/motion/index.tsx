"use client";

/**
 * Motion primitives for the premium-motion-redesign change.
 *
 * One client module so screens import consistent motion instead of hand-rolling
 * framer-motion variants. Every primitive degrades to static when the person
 * prefers reduced motion (via useReducedMotion), on top of the global
 * `MotionConfig reducedMotion="user"` set in MotionProvider.
 */

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Global motion defaults + reduced-motion handling for the app. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {children}
    </MotionConfig>
  );
}

/** Reveal a single block when it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  once = true,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
  /**
   * Parte del bloque que debe entrar en pantalla para revelarlo. En secciones
   * más altas que el viewport, un valor numérico alto puede no alcanzarse
   * nunca; ahí conviene `"some"`.
   */
  amount?: number | "some" | "all";
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Container that staggers the reveal of its StaggerItem children. */
export function Stagger({
  children,
  className,
  delay = 0,
  stagger = 0.06,
  onMount = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Reproduce la entrada al montar en vez de al entrar en el viewport. */
  onMount?: boolean;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: delay,
      },
    },
  };
  const trigger = onMount
    ? { animate: "show" as const }
    : { whileInView: "show" as const, viewport: { once: true, amount: 0.12 } };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={reduce ? false : "hidden"}
      {...trigger}
    >
      {children}
    </motion.div>
  );
}

/** A single item inside <Stagger>. */
export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

export { AnimatePresence, motion, useReducedMotion };
