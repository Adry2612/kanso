import { describe, expect, it } from "vitest";
import {
  GENRE_BRANCHES,
  mapSpotifyGenreToBranch,
  mapSpotifyGenres,
} from "./genres";

describe("mapSpotifyGenreToBranch", () => {
  it("lleva hip hop y rap a hip-hop", () => {
    expect(mapSpotifyGenreToBranch("latin hip hop")).toBe("hip-hop");
    expect(mapSpotifyGenreToBranch("spanish rap")).toBe("hip-hop");
    expect(mapSpotifyGenreToBranch("rap español")).toBe("hip-hop");
    expect(mapSpotifyGenreToBranch("trap")).toBe("hip-hop");
  });

  it("lleva metal, powermetal y metalcore a metal", () => {
    expect(mapSpotifyGenreToBranch("powermetal")).toBe("metal");
    expect(mapSpotifyGenreToBranch("metalcore")).toBe("metal");
    expect(mapSpotifyGenreToBranch("death metal")).toBe("metal");
  });

  it("resuelve otras ramas principales", () => {
    expect(mapSpotifyGenreToBranch("indie rock")).toBe("indie");
    expect(mapSpotifyGenreToBranch("classic rock")).toBe("rock");
    expect(mapSpotifyGenreToBranch("dance pop")).toBe("pop");
    expect(mapSpotifyGenreToBranch("deep house")).toBe("electronic");
    expect(mapSpotifyGenreToBranch("contemporary r&b")).toBe("r&b");
    expect(mapSpotifyGenreToBranch("neo soul")).toBe("soul");
    expect(mapSpotifyGenreToBranch("reggaeton")).toBe("reggaeton");
  });

  it("devuelve null para géneros sin coincidencia o vacíos", () => {
    expect(mapSpotifyGenreToBranch("spoken word")).toBeNull();
    expect(mapSpotifyGenreToBranch("")).toBeNull();
    expect(mapSpotifyGenreToBranch("   ")).toBeNull();
  });
});

describe("mapSpotifyGenres", () => {
  it("deduplica y respeta el orden canónico", () => {
    const result = mapSpotifyGenres([
      "metalcore",
      "latin hip hop",
      "powermetal",
      "spanish rap",
      "unknown",
    ]);

    expect(result).toEqual(
      GENRE_BRANCHES.filter((branch) => ["metal", "hip-hop"].includes(branch)),
    );
  });

  it("devuelve [] sin géneros reconocidos", () => {
    expect(mapSpotifyGenres(["spoken word", "audiobook"])).toEqual([]);
    expect(mapSpotifyGenres([])).toEqual([]);
  });
});
