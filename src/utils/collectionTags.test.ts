import { describe, expect, it } from "vitest";
import { sanitizeCollectionTags } from "./collectionTags";

describe("sanitizeCollectionTags", () => {
  it("resuelve los valores heredados a su clave canónica", () => {
    expect(
      sanitizeCollectionTags([
        { category: "genero", value: "Electrónica" },
        { category: "language", value: "English" },
      ]),
    ).toEqual([
      { category: "género", value: "electronic" },
      { category: "idioma", value: "en" },
    ]);
  });

  it("descarta idioma y género fuera del catálogo", () => {
    expect(
      sanitizeCollectionTags([
        { category: "género", value: "spoken word" },
        { category: "idioma", value: "klingon" },
      ]),
    ).toEqual([]);
  });

  it("deja como máximo un valor por eje y conserva otras categorías", () => {
    expect(
      sanitizeCollectionTags([
        { category: "género", value: "Rock" },
        { category: "género", value: "Jazz" },
        { category: "idioma", value: "Español" },
        { category: "otra", value: "Favorito" },
      ]),
    ).toEqual([
      { category: "género", value: "rock" },
      { category: "idioma", value: "es" },
      { category: "otra", value: "Favorito" },
    ]);
  });

  it("ignora entradas inválidas o listas que no son arrays", () => {
    expect(sanitizeCollectionTags(null)).toEqual([]);
    expect(
      sanitizeCollectionTags([
        { category: "género", value: 3 },
        { value: "rock" },
        { category: "género", value: "  " },
      ]),
    ).toEqual([]);
  });
});
