"use client";

import { signOut } from "firebase/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslations } from "@/context/I18nContext";
import { useTransitionRouter } from "next-view-transitions";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { motion, Reveal } from "@/components/motion";

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Claro",
    bg: "bg-[#368b52]",
    text: "text-white",
  },
  {
    value: "dark",
    label: "Oscuro",
    bg: "bg-[#9be7a5]",
    text: "text-[#102117]",
  },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("header");
  const router = useTransitionRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await signOut(auth);
      router.replace("/");
      router.refresh();
    } catch {
      setSignOutError("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="settings-page collectify-main min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-8 text-xs text-[#368b52] transition hover:opacity-70"
      >
        ← Volver
      </button>
      <Reveal>
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#368b52]">
            Tu espacio
          </p>
          <h1 className="collectify-page-title !mt-3 !text-5xl md:!text-6xl">
            Ajustes generales
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#657468]">
            Personaliza la apariencia y las preferencias de tu experiencia en
            Collectify.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="collectify-panel mt-12 max-w-3xl p-6 md:p-8">
          <div className="flex flex-col gap-5 border-b border-emerald-900/10 pb-7 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="collectify-section-title">Apariencia</h2>
              <p className="mt-2 text-sm text-[#657468]">
                Elige cómo quieres ver tu colección.
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-2 rounded-xl border border-emerald-900/10 bg-emerald-900/5 p-1">
              {THEME_OPTIONS.map((option) => {
                const isActive = theme === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    whileTap={{ scale: 0.97 }}
                    className={`relative rounded-lg px-5 py-2.5 text-sm transition ${
                      isActive
                        ? option.text
                        : "text-[#657468] hover:text-[#1b2b20]"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="settings-theme-pill"
                        className={`absolute inset-0 rounded-lg shadow-sm ${option.bg}`}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                    <span className="relative">{option.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-900/10 bg-white/50 p-4">
              <div className="mb-4 h-16 rounded-lg bg-[#f1f5ef] p-3 shadow-inner">
                <span className="block h-2 w-1/2 rounded bg-[#368b52]" />
                <span className="mt-2 block h-2 w-3/4 rounded bg-[#d9e6da]" />
              </div>
              <strong className="text-sm text-[#1b2b20]">Modo claro</strong>
              <p className="mt-1 text-xs text-[#657468]">
                Superficies luminosas y contraste suave.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-900/10 bg-[#17261c] p-4">
              <div className="mb-4 h-16 rounded-lg bg-[#101b14] p-3 shadow-inner">
                <span className="block h-2 w-1/2 rounded bg-[#9be7a5]" />
                <span className="mt-2 block h-2 w-3/4 rounded bg-[#294331]" />
              </div>
              <strong className="text-sm text-white">Modo oscuro</strong>
              <p className="mt-1 text-xs text-[#8f9f93]">
                Fondos profundos y acento mint.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="collectify-panel mt-5 max-w-3xl p-6 md:p-8">
          <h2 className="collectify-section-title">Preferencias</h2>
          <div className="mt-5 flex items-center justify-between border-t border-emerald-900/10 pt-5">
            <div>
              <p className="text-sm font-semibold text-[#1b2b20]">Idioma</p>
              <p className="mt-1 text-xs text-[#657468]">
                Idioma de la interfaz
              </p>
            </div>
            <span className="rounded-full border border-emerald-900/10 px-3 py-1.5 text-xs text-[#657468]">
              Configurado desde el selector
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-emerald-900/10 pt-5">
            <div>
              <p className="text-sm font-semibold text-[#1b2b20]">Cuenta</p>
              <p className="mt-1 text-xs text-[#657468]">
                Cierra la sesión de Collectify en este dispositivo.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <motion.button
                type="button"
                onClick={() => router.push("/home")}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-emerald-900/15 px-4 py-2 text-xs text-[#368b52] transition hover:bg-emerald-900/5"
              >
                Ir al inicio
              </motion.button>
              <motion.button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-red-700/20 px-4 py-2 text-xs text-red-700 transition hover:bg-red-700/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningOut ? "Cerrando sesión..." : t("logout")}
              </motion.button>
            </div>
          </div>
          {signOutError && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {signOutError}
            </p>
          )}
        </section>
      </Reveal>
    </main>
  );
}
