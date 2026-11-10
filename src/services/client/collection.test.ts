import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Album } from "@/types/album";

const { authFetch } = vi.hoisted(() => ({ authFetch: vi.fn() }));

vi.mock("@/lib/api/authFetch", () => ({ authFetch }));

import { removeCollectionAlbum } from "./collection";

/** Álbum mínimo: el servicio solo necesita el id. */
function albumWithId(id: string): Album {
  return { id, name: "Álbum de prueba" } as Album;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("removeCollectionAlbum", () => {
  beforeEach(() => {
    authFetch.mockReset();
  });

  it("borra con DELETE sobre /api/collection y el id en la query", async () => {
    authFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await removeCollectionAlbum(albumWithId("abc123"));

    expect(authFetch).toHaveBeenCalledTimes(1);
    expect(authFetch).toHaveBeenCalledWith("/api/collection?albumId=abc123", {
      method: "DELETE",
    });
  });

  it("escapa el id antes de incluirlo en la URL", async () => {
    authFetch.mockResolvedValue(jsonResponse({ ok: true }));

    await removeCollectionAlbum(albumWithId("a b&c"));

    expect(authFetch.mock.calls[0][0]).toBe(
      "/api/collection?albumId=a%20b%26c",
    );
  });

  it("propaga el mensaje de error del servidor", async () => {
    authFetch.mockResolvedValue(
      jsonResponse({ error: "Álbum no válido" }, 400),
    );

    await expect(removeCollectionAlbum(albumWithId("abc123"))).rejects.toThrow(
      "Álbum no válido",
    );
  });

  it("usa un mensaje genérico cuando la respuesta no trae JSON", async () => {
    authFetch.mockResolvedValue(new Response("no json", { status: 500 }));

    await expect(removeCollectionAlbum(albumWithId("abc123"))).rejects.toThrow(
      "No se pudo eliminar el álbum",
    );
  });
});
