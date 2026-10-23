"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useI18n, useTranslations } from "@/context/I18nContext";
import { useTransitionRouter } from "next-view-transitions";
import { useRef } from "react";
import { Camera, Check, Loader2, Trash2 } from "lucide-react";
import { motion, Reveal } from "@/components/motion";
import FriendAvatar from "@/components/FriendAvatar";
import ErrorState from "@/components/ErrorState";
import { useSettingsPage } from "@/hooks/client/useSettingsPage";

const THEME_OPTIONS = [
  {
    value: "light",
    titleKey: "appearance.lightTitle",
    descKey: "appearance.lightDesc",
    preview: { backgroundColor: "#f1f5ef", color: "#1b2b20" },
    accent: { backgroundColor: "#2c7a45" },
    muted: { backgroundColor: "#d9e6da" },
  },
  {
    value: "dark",
    titleKey: "appearance.darkTitle",
    descKey: "appearance.darkDesc",
    preview: { backgroundColor: "#101b14", color: "#f2f5ef" },
    accent: { backgroundColor: "#9be7a5" },
    muted: { backgroundColor: "#294331" },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user,
    profileName,
    avatarURL,
    hasCustomAvatar,
    isSigningOut,
    signOutFailed,
    handleSignOut,
    avatarBusy,
    avatarError,
    avatarSuccess,
    handleAvatarSelected,
    handleRemoveAvatar,
  } = useSettingsPage(
    () => {
      router.replace("/");
      router.refresh();
    },
    {
      updated: t("profile.updated"),
      removed: t("profile.removed"),
      invalidType: t("profile.invalidType"),
      tooLarge: t("profile.tooLarge"),
      error: t("profile.error"),
      fallbackName: t("profile.fallbackName"),
    },
  );

  return (
    <main className="settings-page kanso-main min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-8 text-xs text-[var(--kanso-mint)] transition hover:opacity-70"
      >
        ← {t("back")}
      </button>
      <Reveal>
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
            {t("eyebrow")}
          </p>
          <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("subtitle")}
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <section className="kanso-panel mt-12 max-w-3xl p-6 md:p-8">
          <h2 className="kanso-section-title">{t("appearance.title")}</h2>
          <p className="mt-2 text-sm text-[var(--kanso-muted)]">
            {t("appearance.subtitle")}
          </p>

          <div
            role="group"
            aria-label={t("appearance.title")}
            className="mt-6 grid gap-3 sm:grid-cols-2"
          >
            {THEME_OPTIONS.map((option) => {
              const isActive = theme === option.value;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={isActive}
                  whileTap={{ scale: 0.99 }}
                  className={`relative rounded-xl border p-4 text-left transition ${
                    isActive
                      ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)]/10 ring-1 ring-[var(--kanso-mint)]/30"
                      : "border-[var(--kanso-line)] bg-[var(--surface-2)] hover:border-[var(--kanso-mint)]/40"
                  }`}
                >
                  <div
                    className="mb-4 h-20 rounded-lg p-3"
                    style={option.preview}
                  >
                    <span
                      className="block h-2 w-1/2 rounded"
                      style={option.accent}
                    />
                    <span
                      className="mt-2 block h-2 w-3/4 rounded"
                      style={option.muted}
                    />
                    <span
                      className="mt-2 block h-2 w-2/3 rounded"
                      style={option.muted}
                    />
                  </div>
                  <strong className="text-sm text-[var(--foreground)]">
                    {t(option.titleKey)}
                  </strong>
                  <p className="mt-1 text-xs text-[var(--kanso-muted)]">
                    {t(option.descKey)}
                  </p>
                  {isActive && (
                    <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--kanso-mint)] text-[var(--background)]">
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      </Reveal>

      {user && !user.isAnonymous && (
        <Reveal delay={0.075}>
          <section className="kanso-panel mt-5 max-w-3xl p-6 md:p-8">
            <h2 className="kanso-section-title">{t("profile.title")}</h2>
            <p className="mt-2 text-sm text-[var(--kanso-muted)]">
              {t("profile.subtitle")}
            </p>

            <div className="mt-5 flex flex-col gap-5 border-t border-[var(--kanso-line)] pt-5 sm:flex-row sm:items-center">
              <FriendAvatar
                displayName={profileName}
                photoURL={avatarURL}
                size="lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {profileName}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
                  {user.email}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarBusy}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-2.5 text-xs font-bold text-[var(--background)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {avatarBusy ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {avatarBusy
                      ? t("profile.uploading")
                      : avatarURL
                        ? t("profile.change")
                        : t("profile.add")}
                  </button>
                  {hasCustomAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={avatarBusy}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-2.5 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-danger)]/50 hover:text-[var(--kanso-danger)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {t("profile.remove")}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarSelected}
                />

                {avatarError && (
                  <ErrorState
                    variant="inline"
                    className="mt-3"
                    title={avatarError}
                  />
                )}
                {avatarSuccess && (
                  <p
                    role="status"
                    className="mt-3 text-xs text-[var(--kanso-mint)]"
                  >
                    {avatarSuccess}
                  </p>
                )}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <section className="kanso-panel mt-5 max-w-3xl p-6 md:p-8">
          <h2 className="kanso-section-title">{t("preferences.title")}</h2>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--kanso-line)] pt-5">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t("language.title")}
              </p>
              <p className="mt-1 text-xs text-[var(--kanso-muted)]">
                {t("language.subtitle")}
              </p>
            </div>
            <div
              role="group"
              aria-label={t("language.title")}
              className="relative grid grid-cols-2 gap-2 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-2)] p-1"
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
                        : "text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="settings-language-pill"
                        className="absolute inset-0 rounded-lg bg-[var(--kanso-mint)] shadow-sm"
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
          <div className="mt-5 flex items-center justify-between border-t border-[var(--kanso-line)] pt-5">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {t("account.title")}
              </p>
              <p className="mt-1 text-xs text-[var(--kanso-muted)]">
                {t("account.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <motion.button
                type="button"
                onClick={() => router.push("/home")}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-2 text-xs text-[var(--kanso-mint)] transition hover:bg-[var(--surface-2)]"
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
            <ErrorState
              variant="inline"
              className="mt-3"
              title={t("signOutError")}
            />
          )}
        </section>
      </Reveal>
    </main>
  );
}
