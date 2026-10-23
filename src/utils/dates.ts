/** Agrupa elementos por fecha larga en español, conservando el orden. */
export function groupByDate<T extends { providedAt: string }>(
  items: T[],
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};

  items.forEach((item) => {
    const date = new Date(item.providedAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });

  return groups;
}

/** Hora local corta (HH:MM) de una fecha ISO. */
export function formatTime(dateString: string): string {
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
