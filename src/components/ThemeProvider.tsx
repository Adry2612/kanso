"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("collectify-theme");
    const nextTheme: Theme = storedTheme === "dark" ? "dark" : "light";
    setThemeState(nextTheme);
    document.body.classList.toggle("theme-light", nextTheme === "light");
    document.body.classList.toggle("theme-dark", nextTheme === "dark");
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem("collectify-theme", nextTheme);
    document.body.classList.toggle("theme-light", nextTheme === "light");
    document.body.classList.toggle("theme-dark", nextTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
}
