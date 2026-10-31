"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import ErrorState from "@/components/ErrorState";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import {
  SESSION_INVALID_EVENT,
  SESSION_VALID_EVENT,
} from "@/lib/api/authFetch";

/**
 * Estado global de sesión no validada.
 *
 * `authFetch` lo activa cuando el token refrescado sigue siendo rechazado. No
 * cierra la sesión: ofrece una acción explícita para volver a entrar y deja la
 * ruta actual como destino. Se desactiva en `/login` y se limpia cuando cambia
 * la cuenta o una petición vuelve a funcionar.
 */
export default function SessionGuard({ children }: { children: ReactNode }) {
  const t = useTranslations("common");
  const { user } = useAuth();
  const pathname = usePathname();
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const handleInvalid = () => setInvalid(true);
    const handleValid = () => setInvalid(false);

    window.addEventListener(SESSION_INVALID_EVENT, handleInvalid);
    window.addEventListener(SESSION_VALID_EVENT, handleValid);

    return () => {
      window.removeEventListener(SESSION_INVALID_EVENT, handleInvalid);
      window.removeEventListener(SESSION_VALID_EVENT, handleValid);
    };
  }, []);

  useEffect(() => {
    if (!user) setInvalid(false);
  }, [user]);

  useEffect(() => {
    if (pathname === "/login") setInvalid(false);
  }, [pathname]);

  if (!invalid || pathname === "/login") return <>{children}</>;

  const currentPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : pathname;
  const loginHref = `/login?mode=login&next=${encodeURIComponent(currentPath)}`;

  return (
    <main className="kanso-main min-h-screen">
      <ErrorState
        variant="page"
        title={t("sessionInvalidTitle")}
        description={t("sessionInvalidDescription")}
        action={
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:brightness-105"
          >
            {t("sessionSignIn")}
          </Link>
        }
      />
    </main>
  );
}
