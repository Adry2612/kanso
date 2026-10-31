import { describe, expect, it } from "vitest";
import es from "@/locales/es.json";
import en from "@/locales/en.json";
import {
  canonicalizeTag,
  canonicalizeTags,
  normalizeGenreValue,
  normalizeLanguageValue,
  tagDisplayLabel,
} from "./taxonomy";

const translatorFrom = (messages: Record<string, unknown>) => (key: string) => {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, messages);

  return typeof value === "string" ? value : key;
};

describe("normalizeGenreValue", () => {
  it("resuelve las variantes de electrónica", () => {
    expect(normalizeGenreValue("Electrónica")).toBe("electronic");
    expect(normalizeGenreValue("electronica")).toBe("electronic");
    expect(normalizeGenreValue("Electronic")).toBe("electronic");
    expect(normalizeGenreValue("ELECTRÓNICA")).toBe("electronic");
  });

  it("resuelve las ramas canónicas y sus alias", () => {
    expect(normalizeGenreValue("Hip-Hop")).toBe("hip-hop");
    expect(normalizeGenreValue("hip hop")).toBe("hip-hop");
    expect(normalizeGenreValue("rap")).toBe("hip-hop");
    expect(normalizeGenreValue("R&B")).toBe("r&b");
    expect(normalizeGenreValue("Reggaetón")).toBe("reggaeton");
  });

  it("devuelve null para valores fuera del catálogo o vacíos", () => {
    expect(normalizeGenreValue("spoken word")).toBeNull();
    expect(normalizeGenreValue("")).toBeNull();
    expect(normalizeGenreValue(null)).toBeNull();
  });
});

describe("normalizeLanguageValue", () => {
  it("resuelve nombres y códigos", () => {
    expect(normalizeLanguageValue("Inglés")).toBe("en");
    expect(normalizeLanguageValue("ingles")).toBe("en");
    expect(normalizeLanguageValue("English")).toBe("en");
    expect(normalizeLanguageValue("en")).toBe("en");
    expect(normalizeLanguageValue("Español")).toBe("es");
    expect(normalizeLanguageValue("castellano")).toBe("es");
  });

  it("devuelve null para idiomas fuera del catálogo", () => {
    expect(normalizeLanguageValue("klingon")).toBeNull();
    expect(normalizeLanguageValue(undefined)).toBeNull();
  });
});

describe("canonicalizeTag", () => {
  it("normaliza la categoría y el valor", () => {
    expect(
      canonicalizeTag({ category: "genero", value: "Electrónica" }),
    ).toEqual({ category: "género", value: "electronic" });
    expect(canonicalizeTag({ category: "genre", value: "Hip-Hop" })).toEqual({
      category: "género",
      value: "hip-hop",
    });
    expect(canonicalizeTag({ category: "language", value: "English" })).toEqual(
      { category: "idioma", value: "en" },
    );
  });

  it("descarta valores de idioma o género fuera del catálogo", () => {
    expect(
      canonicalizeTag({ category: "género", value: "spoken word" }),
    ).toBeNull();
    expect(
      canonicalizeTag({ category: "idioma", value: "klingon" }),
    ).toBeNull();
  });

  it("conserva las categorías heredadas", () => {
    expect(canonicalizeTag({ category: "Otra", value: "Favorito" })).toEqual({
      category: "otra",
      value: "Favorito",
    });
  });
});

describe("canonicalizeTags", () => {
  it("deja como máximo un idioma y un género", () => {
    const result = canonicalizeTags([
      { category: "género", value: "Electrónica" },
      { category: "genero", value: "Rock" },
      { category: "idioma", value: "Español" },
      { category: "language", value: "English" },
    ]);

    expect(result).toEqual([
      { category: "género", value: "electronic" },
      { category: "idioma", value: "es" },
    ]);
  });

  it("deduplica etiquetas equivalentes y descarta las no reconocidas", () => {
    const result = canonicalizeTags([
      { category: "idioma", value: "en" },
      { category: "idioma", value: "English" },
      { category: "género", value: "spoken word" },
      { category: "otra", value: "Favorito" },
    ]);

    expect(result).toEqual([
      { category: "idioma", value: "en" },
      { category: "otra", value: "Favorito" },
    ]);
  });
});

describe("tagDisplayLabel", () => {
  const t = (key: string) =>
    ({
      "genres.electronic": "Electrónica",
      "languages.en": "Inglés",
      "genres.rock": "Rock",
      "languages.es": "Español",
    })[key] ?? key;

  it("traduce las claves canónicas", () => {
    expect(
      tagDisplayLabel({ category: "género", value: "electronic" }, t),
    ).toBe("Electrónica");
    expect(tagDisplayLabel({ category: "idioma", value: "en" }, t)).toBe(
      "Inglés",
    );
  });

  it("traduce también las etiquetas heredadas", () => {
    expect(tagDisplayLabel({ category: "genero", value: "Rock" }, t)).toBe(
      "Rock",
    );
    expect(tagDisplayLabel({ category: "language", value: "Español" }, t)).toBe(
      "Español",
    );
  });

  it("deja intactas las categorías libres", () => {
    expect(tagDisplayLabel({ category: "otra", value: "Favorito" }, t)).toBe(
      "Favorito",
    );
  });

  it("usa las traducciones reales de español e inglés", () => {
    const tag = { category: "género", value: "electronic" };
    const language = { category: "idioma", value: "en" };

    expect(tagDisplayLabel(tag, translatorFrom(es.taxonomy))).toBe(
      "Electrónica",
    );
    expect(tagDisplayLabel(tag, translatorFrom(en.taxonomy))).toBe(
      "Electronic",
    );
    expect(tagDisplayLabel(language, translatorFrom(es.taxonomy))).toBe(
      "Inglés",
    );
    expect(tagDisplayLabel(language, translatorFrom(en.taxonomy))).toBe(
      "English",
    );
  });
});
