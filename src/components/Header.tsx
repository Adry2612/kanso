"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTransitionRouter } from "next-view-transitions";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  History,
  Home,
  Menu,
  Search,
  Settings,
  Sparkles,
  Users,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "@/components/motion";

export default function Header() {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const t = useTranslations("header");
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const isPublicPage =
    pathname === "/" || pathname === "/login" || pathname.startsWith("/f/");
  const profileName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0] ||
    (user?.isAnonymous ? t("guest") : t("profile"));
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const navItems: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/home", label: t("home"), icon: Home },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/artists", label: t("artists"), icon: Users },
    { href: "/releases", label: t("releases"), icon: Sparkles },
    { href: "/friends", label: t("friends"), icon: UsersRound },
    { href: "/favorites", label: t("favorites"), icon: Heart },
    { href: "/recomendationHistory", label: t("history"), icon: History },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  useEffect(() => {
    // En las páginas públicas no hay panel: el contenido ocupa todo el ancho.
    document.body.classList.toggle("public-shell", isPublicPage);

    if (isPublicPage) {
      document.body.classList.remove("sidebar-collapsed");
      return;
    }

    const saved = window.localStorage.getItem("kanso-sidebar-collapsed");
    const stored =
      saved ??
      // Clave anterior, de cuando la aplicación se llamaba Collectify: se lee
      // una sola vez para no perder la preferencia de quien ya la tenía.
      window.localStorage.getItem("collectify-sidebar-collapsed");
    // Migrada la preferencia, a partir de aquí solo se lee la clave nueva.
    if (!saved && stored) {
      window.localStorage.setItem("kanso-sidebar-collapsed", stored);
    }
    const collapsed = stored === "true";
    setSidebarCollapsed(collapsed);
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [isPublicPage]);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    window.localStorage.setItem("kanso-sidebar-collapsed", String(next));
    document.body.classList.toggle("sidebar-collapsed", next);
  };

  /** Cierra el cajón móvil y devuelve el foco al botón que lo abrió. */
  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  // El cajón no sobrevive a un cambio de sección.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Si la ventana crece hasta escritorio, el cajón deja de existir: cerrarlo
  // evita quedarse con el scroll del fondo bloqueado.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, []);

  // Cajón abierto: bloquea el scroll del fondo, lleva el foco dentro, lo encierra
  // con Tab/Mayús+Tab y lo libera con Escape.
  useEffect(() => {
    if (!mobileOpen) return;

    const drawer = drawerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const focusables = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  if (isPublicPage) return null;

  return (
    <>
      {/* Barra superior de pantallas estrechas: en el flujo, para no tener que
          compensar su altura con padding. */}
      <header className="kanso-mobile-bar lg:hidden">
        <button
          type="button"
          aria-label={t("brandHome")}
          className="flex items-center gap-2 font-semibold tracking-tight text-[var(--kanso-mint)]"
          onClick={() => router.push("/home")}
        >
          <Image
            src="/kanso-logo.png"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7 max-w-none shrink-0"
          />
          <span className="text-base">kanso.</span>
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="kanso-nav"
          aria-label={t("openMenu")}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--kanso-line)] text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/40"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          aria-label={t("closeMenu")}
          className="kanso-scrim lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        id="kanso-nav"
        ref={drawerRef}
        data-open={mobileOpen ? "true" : undefined}
        className="kanso-sidebar fixed inset-y-0 left-0 flex flex-col px-2 py-4 lg:px-5 lg:py-7"
      >
        <button
          aria-label={t("brandHome")}
          className="kanso-brand flex items-center gap-2 px-2 font-semibold tracking-tight text-[var(--kanso-mint)]"
          onClick={() => router.push("/home")}
        >
          <Image
            src="/kanso-logo.png"
            alt=""
            width={28}
            height={28}
            priority
            className="h-7 w-7 max-w-none shrink-0"
          />
          <span className="sidebar-label text-xl">kanso.</span>
        </button>

        {/* Colapso de escritorio. En móvil el cajón se cierra con el botón de al
            lado, así que este control no se muestra. */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? t("openMenu") : t("closeMenu")}
          className="sidebar-toggle absolute right-3 top-7 hidden h-7 w-7 items-center justify-center rounded-lg border border-[var(--kanso-line)] text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)]/40 hover:text-[var(--kanso-mint)] lg:flex"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMobile}
          aria-label={t("closeMenu")}
          className="absolute right-2 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-[var(--kanso-muted)] transition hover:text-[var(--foreground)] lg:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav className="mt-16 grid gap-2 text-sm" aria-label={t("mainNav")}>
          <span className="sidebar-label px-3 pb-2 text-[10px] uppercase tracking-[.18em] text-[var(--kanso-muted)]">
            {t("sectionLabel")}
          </span>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <motion.button
                key={item.href}
                type="button"
                whileHover={{ x: sidebarCollapsed ? 0 : 3 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                  isActive
                    ? "text-[var(--foreground)]"
                    : "text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
                }`}
                onClick={() => router.push(item.href)}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl border border-[var(--kanso-mint)]/30 bg-[var(--kanso-mint)]/10"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon
                  className={`relative h-[18px] w-[18px] ${
                    isActive
                      ? "text-[var(--kanso-mint)]"
                      : "text-[var(--kanso-mint)]/70"
                  }`}
                  strokeWidth={1.75}
                />
                <span className="sidebar-label relative">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => router.push("/settings")}
          className="mt-8 flex items-center gap-3 rounded-xl border-t border-[var(--kanso-line)] px-2 pt-4 text-left text-[var(--kanso-muted)] transition hover:text-[var(--foreground)]"
        >
          <span
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-full border-2 border-[var(--kanso-line-strong)] bg-[#d1a578] text-center text-[10px] font-bold leading-8 text-[var(--foreground)]"
          >
            {profileInitials}
          </span>
          <span className="sidebar-label min-w-0">
            <strong className="block truncate text-sm text-[var(--kanso-muted)]">
              {profileName}
            </strong>
            <small className="block truncate text-xs text-[var(--kanso-muted)]">
              {user?.isAnonymous
                ? t("testSession")
                : user?.email || t("yourProfile")}
            </small>
          </span>
        </button>
        <p className="sidebar-label mt-auto border-t border-[var(--kanso-line)] px-2 pt-5 text-xs leading-relaxed text-[var(--kanso-muted)]">
          <strong className="mb-1 block font-semibold text-[var(--kanso-mint)]">
            {t("sidebarTagline")}
          </strong>
          {t("sidebarSubtitle")}
        </p>
      </aside>
    </>
  );
}
