import type { ListenLaterAlbum, ListenLaterItem } from "@/types/favorites";

/** Pendientes del más reciente al más antiguo. */
export function sortListenLater(items: ListenLaterItem[]): ListenLaterItem[] {
  return [...items].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}

/** Filtra pendientes por título o artistas. */
export function filterListenLaterByQuery(
  items: ListenLaterItem[],
  query: string,
): ListenLaterItem[] {
  const term = query.trim().toLowerCase();
  if (!term) return items;

  return items.filter((pendingAlbum) => {
    const artists = (pendingAlbum.album.artists ?? [])
      .map((artist) => artist?.name ?? "")
      .join(" ");
    return `${pendingAlbum.album.name ?? ""} ${artists}`
      .toLowerCase()
      .includes(term);
  });
}

export type { ListenLaterAlbum };
