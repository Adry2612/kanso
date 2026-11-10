import { describe, expect, it } from "vitest";
import type { ListenLaterItem } from "@/types/collection";
import { getRecentListenLater, sortListenLater } from "./listenLater";

function pending(id: string, addedAt: string): ListenLaterItem {
  return {
    id,
    albumId: `album-${id}`,
    addedAt,
    album: { id: `album-${id}`, name: `Álbum ${id}`, artists: [] },
  } as unknown as ListenLaterItem;
}

describe("sortListenLater", () => {
  it("ordena del más reciente al más antiguo sin mutar la entrada", () => {
    const items = [
      pending("antiguo", "2026-01-01T10:00:00.000Z"),
      pending("nuevo", "2026-05-01T10:00:00.000Z"),
      pending("medio", "2026-03-01T10:00:00.000Z"),
    ];

    expect(sortListenLater(items).map((item) => item.id)).toEqual([
      "nuevo",
      "medio",
      "antiguo",
    ]);
    expect(items.map((item) => item.id)).toEqual(["antiguo", "nuevo", "medio"]);
  });
});

describe("getRecentListenLater", () => {
  it("devuelve como máximo los pendientes indicados, empezando por el más reciente", () => {
    const items = [
      pending("a", "2026-01-01T10:00:00.000Z"),
      pending("b", "2026-04-01T10:00:00.000Z"),
      pending("c", "2026-02-01T10:00:00.000Z"),
      pending("d", "2026-05-01T10:00:00.000Z"),
    ];

    expect(getRecentListenLater(items).map((item) => item.id)).toEqual([
      "d",
      "b",
      "c",
    ]);
    expect(getRecentListenLater(items, 2).map((item) => item.id)).toEqual([
      "d",
      "b",
    ]);
  });

  it("devuelve una lista vacía cuando no hay pendientes", () => {
    expect(getRecentListenLater([])).toEqual([]);
  });
});
