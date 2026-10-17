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
    (user?.isAnonymous ? "Invitado" : "Perfil");
  const profileInitials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const navItems: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/home", label: "Inicio", icon: Home },
    { href: "/search", label: t("search"), icon: Search },
    { href: "/favorites", label: t("favorites"), icon: Heart },
    { href: "/recomendationHistory", label: t("history"), icon: History },
    { href: "/settings", label: "Ajustes", icon: Settings },
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
        aria-label="Collectify, ir al inicio"
        className="collectify-brand flex items-center px-2 font-semibold tracking-tight text-emerald-100"
        onClick={() => router.push("/home")}
      >
        <span className="sidebar-label text-xl">collectify</span>
      </button>
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Abrir menú" : "Cerrar menú"}
        className="sidebar-toggle absolute right-3 top-7 flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100/10 text-[#8f9f93] transition hover:border-[#9be7a5]/40 hover:text-[#9be7a5]"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <nav
        className="mt-16 grid gap-2 text-sm"
        aria-label="Navegación principal"
      >
        <span className="sidebar-label px-3 pb-2 text-[10px] uppercase tracking-[.18em] text-[#5e7162]">
          Tu espacio
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
                isActive ? "text-white" : "text-[#8f9f93] hover:text-white"
              }`}
              onClick={() => router.push(item.href)}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl border border-[#9be7a5]/30 bg-[#9be7a5]/10"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                className={`relative h-[18px] w-[18px] ${
                  isActive ? "text-[#9be7a5]" : "text-[#9be7a5]/70"
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
        aria-label="Abrir perfil"
        onClick={() => router.push("/settings")}
        className="mt-8 flex items-center gap-3 rounded-xl border-t border-emerald-100/10 px-2 pt-4 text-left text-[#8f9f93] transition hover:text-white"
      >
        <span className="h-9 w-9 shrink-0 rounded-full border-2 border-emerald-300/30 bg-[#d1a578] text-center text-[10px] font-bold leading-8 text-[#233321]">
          {profileInitials}
        </span>
        <span className="sidebar-label min-w-0">
          <strong className="block truncate text-sm text-[#b4c2b6]">
            {profileName}
          </strong>
          <small className="block truncate text-xs text-[#8f9f93]">
            {user?.isAnonymous
              ? "Sesión de prueba"
              : user?.email || "Tu perfil"}
          </small>
        </span>
      </button>
      <p className="sidebar-label mt-auto border-t border-emerald-100/10 px-2 pt-5 text-xs leading-relaxed text-[#8f9f93]">
        <strong className="mb-1 block font-semibold text-[#9be7a5]">
          Tu colección, a tu ritmo.
        </strong>
        Guarda discos y vuelve a tus momentos favoritos.
      </p>
    </aside>
  );
}
