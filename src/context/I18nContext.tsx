"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import es from "@/locales/es.json";
import en from "@/locales/en.json";

type Locale = "es" | "en";
type Messages = typeof es;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: string, key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  es,
  en,
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem("locale") as Locale;
    if (savedLocale && (savedLocale === "es" || savedLocale === "en")) {
      setLocaleState(savedLocale);
    }
  }, []);

  // El idioma activo debe declararse en el documento.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  const t = (namespace: string, key: string): string => {
    const msg = messages[locale];
    // Soportar claves anidadas como 'sort.recent'
    const keys = key.split(".");
    // @ts-expect-error - dynamic namespace/key lookup into nested messages
    let value = msg[namespace];

    for (const k of keys) {
      if (value && typeof value === "object") {
        // `value` is `any` here, so indexing by the nested key is fine.
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function useTranslations(namespace: string) {
  const { t } = useI18n();
  return (key: string) => t(namespace, key);
}

export function useLocale() {
  const { locale } = useI18n();
  return locale;
}
