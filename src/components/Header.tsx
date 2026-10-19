"use client";

import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  History,
  Home,
  Search,
  Settings,
  Sparkles,
  Users,
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
  const isPublicPage = pathname === "/" || pathname === "/login";
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
    { href: "/favorites", label: t("favorites"), icon: Heart },
    { href: "/recomendationHistory", label: t("history"), icon: History },
    { href: "/settings", label: t("settings"), icon: Settings },
  ];

  useEffect(() => {
    if (isPublicPage) {
      document.body.classList.remove("sidebar-collapsed");
      return;
    }

    const collapsed =
      window.localStorage.getItem("collectify-sidebar-collapsed") === "true";
    setSidebarCollapsed(collapsed);
    document.body.classList.toggle("sidebar-collapsed", collapsed);
  }, [isPublicPage]);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    window.localStorage.setItem("collectify-sidebar-collapsed", String(next));
    document.body.classList.toggle("sidebar-collapsed", next);
  };

  if (isPublicPage) return null;

  return (
    <aside className="collectify-sidebar fixed inset-y-0 left-0 z-40 flex flex-col px-2 py-4 lg:px-5 lg:py-7">
      <button
        aria-label={t("brandHome")}
        className="collectify-brand flex items-center px-2 font-semibold tracking-tight text-[var(--collectify-mint)]"
        onClick={() => router.push("/home")}
      >
        <span className="sidebar-label text-xl">kanso.</span>
      </button>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? t("openMenu") : t("closeMenu")}
        className="sidebar-toggle absolute right-3 top-7 flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--collectify-line)] text-[var(--collectify-muted)] transition hover:border-[var(--collectify-mint)]/40 hover:text-[var(--collectify-mint)]"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <nav className="mt-16 grid gap-2 text-sm" aria-label={t("mainNav")}>
        <span className="sidebar-label px-3 pb-2 text-[10px] uppercase tracking-[.18em] text-[var(--collectify-muted)]">
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
                  : "text-[var(--collectify-muted)] hover:text-[var(--foreground)]"
              }`}
              onClick={() => router.push(item.href)}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-[var(--collectify-mint)]/30 bg-[var(--collectify-mint)]/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                className={`relative h-[18px] w-[18px] ${
                  isActive
                    ? "text-[var(--collectify-mint)]"
                    : "text-[var(--collectify-mint)]/70"
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
        className="mt-8 flex items-center gap-3 rounded-xl border-t border-[var(--collectify-line)] px-2 pt-4 text-left text-[var(--collectify-muted)] transition hover:text-[var(--foreground)]"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-full border-2 border-[var(--collectify-line-strong)] bg-[#d1a578] text-center text-[10px] font-bold leading-8 text-[var(--foreground)]"
        >
          {profileInitials}
        </span>
        <span className="sidebar-label min-w-0">
          <strong className="block truncate text-sm text-[var(--collectify-muted)]">
            {profileName}
          </strong>
          <small className="block truncate text-xs text-[var(--collectify-muted)]">
            {user?.isAnonymous
              ? t("testSession")
              : user?.email || t("yourProfile")}
          </small>
        </span>
      </button>
      <p className="sidebar-label mt-auto border-t border-[var(--collectify-line)] px-2 pt-5 text-xs leading-relaxed text-[var(--collectify-muted)]">
        <strong className="mb-1 block font-semibold text-[var(--collectify-mint)]">
          {t("sidebarTagline")}
        </strong>
        {t("sidebarSubtitle")}
      </p>
    </aside>
  );
}
