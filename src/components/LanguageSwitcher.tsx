"use client";

import { useI18n } from "@/context/I18nContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setLocale("es")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          locale === "es"
            ? "bg-green-600 text-white"
            : "bg-green-900/50 text-green-400 hover:bg-green-900"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          locale === "en"
            ? "bg-green-600 text-white"
            : "bg-green-900/50 text-green-400 hover:bg-green-900"
        }`}
      >
        EN
      </button>
    </div>
  );
}
