"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import { Bell, X } from "lucide-react";

type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastInput = {
  title: string;
  description?: string;
  action?: ToastAction;
  icon?: ReactNode;
  duration?: number;
};

type ToastItem = ToastInput & {
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => number;
  dismissToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useTranslations("toast");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current + 1;
      nextId.current = id;

      setToasts((current) => {
        const next = [...current, { ...toast, id }];
        // Evita que una ráfaga de solicitudes tape toda la pantalla.
        return next.slice(-3);
      });

      const duration = toast.duration ?? 6500;
      const timer = window.setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      currentTimers.forEach((timer) => window.clearTimeout(timer));
      currentTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              role="status"
              className="pointer-events-auto overflow-hidden rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,.55)] backdrop-blur-xl"
            >
              <div className="flex items-start gap-3 p-4">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--kanso-mint)]/25 bg-[var(--kanso-mint)]/10 text-[var(--kanso-mint)]">
                  {toast.icon ?? (
                    <Bell className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="mt-1 text-xs leading-relaxed text-[var(--kanso-muted)]">
                      {toast.description}
                    </p>
                  )}
                  {toast.action && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick();
                        dismissToast(toast.id);
                      }}
                      className="mt-3 text-xs font-bold text-[var(--kanso-mint)] transition hover:underline"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label={t("close")}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--kanso-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
