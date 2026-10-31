/** Fecha larga localizada para las cabeceras de grupo. */
export function formatLongDate(value: string | Date, locale = "es"): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Agrupa elementos por fecha larga conservando el orden de entrada. */
export function groupByDate<T>(
  items: T[],
  getDate: (item: T) => string | Date,
  locale = "es",
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  items.forEach((item) => {
    const date = formatLongDate(getDate(item), locale);

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });

  return groups;
}

/** Hora local corta (HH:MM) de una fecha ISO. */
export function formatTime(dateString: string | Date): string {
  return new Date(dateString).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Fecha de hoy para la cabecera de Inicio, ya localizada. */
export function formatTodayLabel(language: string): string {
  const formatter = new Intl.DateTimeFormat(language || "es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const label = formatter.format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}
