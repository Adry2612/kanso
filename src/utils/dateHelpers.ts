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

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
