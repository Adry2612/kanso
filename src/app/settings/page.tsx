"use client";

import { signOut } from "firebase/auth";
import { useTheme } from "@/components/ThemeProvider";
import { useI18n, useTranslations } from "@/context/I18nContext";
import { useTransitionRouter } from "next-view-transitions";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { motion, Reveal } from "@/components/motion";

const THEME_OPTIONS = [
  {
    value: "light",
    labelKey: "appearance.light",
    bg: "bg-[var(--collectify-mint)]",
    text: "text-[var(--foreground)]",
  },
  {
    value: "dark",
    labelKey: "appearance.dark",
    bg: "bg-[var(--collectify-mint)]",
    text: "text-[var(--background)]",
  },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "es", labelKey: "language.es" },
  { value: "en", labelKey: "language.en" },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const t = useTranslations("settings");
  const router = useTransitionRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutFailed(false);
    try {
      await signOut(auth);
      router.replace("/");
      router.refresh();
    } catch {
      setSignOutFailed(true);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="settings-page collectify-main min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-8 text-xs text-[var(--collectify-mint)] transition hover:opacity-70"
      >
        ← {t("back")}
      </button>
      <Reveal>
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--collectify-mint)]">
            {t("eyebrow")}
          </p>
          <h1 className="collectify-page-title !mt-3 !text-5xl md:!text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--collectify-muted)]">
            {t("subtitle")}
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="collectify-panel mt-12 max-w-3xl p-6 md:p-8">
          <div className="flex flex-col gap-5 border-b border-[var(--collectify-line)] pb-7 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="collectify-section-title">
                {t("appearance.title")}
              </h2>
              <p className="mt-2 text-sm text-[var(--collectify-muted)]">
                {t("appearance.subtitle")}
              </p>
            </div>
            <div className="relative grid grid-cols-2 gap-2 rounded-xl border border-[var(--collectify-line)] bg-[var(--surface-2)] p-1">
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
                        : "text-[var(--collectify-muted)] hover:text-[var(--foreground)]"
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
                    <span className="relative">{t(option.labelKey)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--collectify-line)] bg-[var(--surface-2)] p-4">
              <div className="mb-4 h-16 rounded-lg bg-[var(--surface-1)] p-3 shadow-inner">
                <span className="block h-2 w-1/2 rounded bg-[var(--collectify-mint)]" />
                <span className="mt-2 block h-2 w-3/4 rounded bg-[var(--surface-3)]" />
              </div>
              <strong className="text-sm text-[var(--foreground)]">
                {t("appearance.lightTitle")}
              </strong>
              <p className="mt-1 text-xs text-[var(--collectify-muted)]">
                {t("appearance.lightDesc")}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--collectify-line)] bg-[var(--surface-1)] p-4">
              <div className="mb-4 h-16 rounded-lg bg-[var(--surface-1)] p-3 shadow-inner">
                <span className="block h-2 w-1/2 rounded bg-[var(--collectify-mint)]" />
                <span className="mt-2 block h-2 w-3/4 rounded bg-[var(--surface-3)]" />
              </div>
              <strong className="text-sm text-[var(--foreground)]">
                {t("appearance.darkTitle")}
              </strong>
              <p className="mt-1 text-xs text-[var(--collectify-muted)]">
                {t("appearance.darkDesc")}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="collectify-panel mt-5 max-w-3xl p-6 md:p-8">
          <h2 className="collectify-section-title">{t("preferences.title")}</h2>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--collectify-line)] pt-5">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t("language.title")}
              </p>
              <p className="mt-1 text-xs text-[var(--collectify-muted)]">
                {t("language.subtitle")}
              </p>
            </div>
            <div
              role="group"
              aria-label={t("language.title")}
              className="relative grid grid-cols-2 gap-2 rounded-xl border border-[var(--collectify-line)] bg-[var(--surface-2)] p-1"
            >
              {LANGUAGE_OPTIONS.map((option) => {
                const isActive = locale === option.value;
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => setLocale(option.value)}
                    aria-pressed={isActive}
                    whileTap={{ scale: 0.97 }}
                    className={`relative rounded-lg px-5 py-2.5 text-sm transition ${
                      isActive
                        ? "text-[var(--background)]"
                        : "text-[var(--collectify-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="settings-language-pill"
                        className="absolute inset-0 rounded-lg bg-[var(--collectify-mint)] shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                    <span className="relative">{t(option.labelKey)}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-[var(--collectify-line)] pt-5">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t("account.title")}
              </p>
              <p className="mt-1 text-xs text-[var(--collectify-muted)]">
                {t("account.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <motion.button
                type="button"
                onClick={() => router.push("/home")}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-[var(--collectify-line)] px-4 py-2 text-xs text-[var(--collectify-mint)] transition hover:bg-[var(--surface-2)]"
              >
                {t("account.goHome")}
              </motion.button>
              <motion.button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-red-700/20 px-4 py-2 text-xs text-red-700 transition hover:bg-red-700/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSigningOut ? t("account.signingOut") : t("account.logout")}
              </motion.button>
            </div>
          </div>
          {signOutFailed && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {t("signOutError")}
            </p>
          )}
        </section>
      </Reveal>
    </main>
  );
}
