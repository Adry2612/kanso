import type { ArtistRelease } from "@/types/artists";

/** Agrupa lanzamientos por mes (`YYYY-MM`), del más reciente al más antiguo. */
export function groupReleasesByMonth(
  releases: ArtistRelease[],
): Array<[string, ArtistRelease[]]> {
  const byMonth = new Map<string, ArtistRelease[]>();

  releases.forEach((release) => {
    const month = (release.releaseDate || "").slice(0, 7);
    if (!month) return;
    const list = byMonth.get(month) ?? [];
    list.push(release);
    byMonth.set(month, list);
  });

  return Array.from(byMonth.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

/** Etiqueta localizada del mes de lanzamiento. */
export function formatReleaseMonth(month: string): string {
  const [year, monthIndex] = month.split("-");
  return new Date(Number(year), Number(monthIndex) - 1, 1).toLocaleDateString(
    undefined,
    { month: "long", year: "numeric" },
  );
}

/** Clave de traducción del tipo de lanzamiento. */
export function getReleaseTypeKey(
  release: ArtistRelease,
): "typeAlbum" | "typeEp" | "typeSingle" | "typeRelease" {
  if (release.albumType === "album") return "typeAlbum";
  if (release.albumType === "single") {
    return (release.totalTracks ?? 0) >= 3 ? "typeEp" : "typeSingle";
  }
  return "typeRelease";
}
