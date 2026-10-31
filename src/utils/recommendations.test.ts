import { describe, expect, it } from "vitest";
import {
  feedbackBoostFor,
  matchesCollectionFormat,
  matchesRecommendationTags,
  overlapRatio,
  recencyPenalty,
  scoreCandidate,
  scoreCandidateBreakdown,
} from "./recommendations";

describe("overlapRatio", () => {
  it("calcula la proporción del objetivo presente", () => {
    expect(overlapRatio(["joy", "energy"], ["joy", "calm"])).toBe(0.5);
    expect(overlapRatio(["joy"], ["joy"])).toBe(1);
    expect(overlapRatio([], ["joy"])).toBe(0);
    expect(overlapRatio(["joy"], [])).toBe(0);
  });
});

describe("recencyPenalty", () => {
  it("penaliza más lo más reciente", () => {
    expect(recencyPenalty("a", ["a", "b", "c"])).toBe(1);
    expect(recencyPenalty("b", ["a", "b", "c"])).toBeCloseTo(0.9);
    expect(recencyPenalty("c", ["a", "b", "c"])).toBeCloseTo(0.8);
  });

  it("no penaliza fuera de la ventana ni sin historial", () => {
    expect(recencyPenalty("z", ["a", "b"])).toBe(0);
    expect(recencyPenalty("a", [])).toBe(0);
  });
});

describe("scoreCandidate", () => {
  it("puntúa solo con la coincidencia de etiquetas", () => {
    expect(scoreCandidate({ labelOverlap: 1 })).toBe(1);
    expect(scoreCandidate({ labelOverlap: 0.5 })).toBe(0.5);
    expect(scoreCandidate({ labelOverlap: 0 })).toBe(0);
  });

  it("resta recencia y suma valoración", () => {
    expect(scoreCandidate({ labelOverlap: 1, recencyPenalty: 1 })).toBeCloseTo(
      0.65,
    );
    expect(scoreCandidate({ labelOverlap: 1, feedbackBoost: 1 })).toBeCloseTo(
      1.5,
    );
    expect(
      scoreCandidate({
        labelOverlap: 1,
        recencyPenalty: 1,
        feedbackBoost: -1,
      }),
    ).toBeCloseTo(0.15);
  });

  it("una coincidencia mayor gana antes de recencia y valoración", () => {
    expect(scoreCandidate({ labelOverlap: 1 })).toBeGreaterThan(
      scoreCandidate({ labelOverlap: 0.5 }),
    );
  });
});

describe("scoreCandidateBreakdown", () => {
  it("coincide con scoreCandidate en todos los perfiles", () => {
    const signals = [
      { labelOverlap: 1 },
      { labelOverlap: 0.4 },
      {
        labelOverlap: 0.6,
        recencyPenalty: 0.5,
        feedbackBoost: -1,
      },
    ];

    for (const signal of signals) {
      expect(scoreCandidateBreakdown(signal).finalScore).toBeCloseTo(
        scoreCandidate(signal),
      );
    }
  });

  it("expone coincidencia, recencia y valoración por separado", () => {
    const breakdown = scoreCandidateBreakdown({
      labelOverlap: 0.5,
      recencyPenalty: 1,
      feedbackBoost: 1,
    });

    expect(breakdown.labelOverlap).toBe(0.5);
    expect(breakdown.baseScore).toBe(0.5);
    expect(breakdown.recencyPenalty).toBe(1);
    expect(breakdown.feedbackBoost).toBe(1);
    expect(breakdown.finalScore).toBeCloseTo(0.65);
  });
});

describe("filtros de candidatos", () => {
  it("excluye un pendiente al filtrar por formato", () => {
    expect(matchesCollectionFormat(undefined, "vinyl")).toBe(false);
    expect(matchesCollectionFormat(undefined, "all")).toBe(true);
  });

  it("excluye un pendiente al filtrar por etiquetas", () => {
    expect(matchesRecommendationTags(undefined, ["género:rock"])).toBe(false);
    expect(matchesRecommendationTags(undefined, [])).toBe(true);
  });

  it("acepta el formato y la etiqueta que coinciden", () => {
    expect(matchesCollectionFormat(["vinyl"], "vinyl")).toBe(true);
    expect(
      matchesRecommendationTags(
        [{ category: "género", value: "Rock" }],
        ["género:rock"],
      ),
    ).toBe(true);
  });
});

describe("feedbackBoostFor", () => {
  const feedback = new Map([
    ["liked", { liked: true, topMoods: ["joy", "energy"] }],
    ["disliked", { liked: false, topMoods: ["calm"] }],
  ]);

  it("aplica el signo completo al álbum valorado", () => {
    expect(feedbackBoostFor("liked", ["joy"], feedback)).toBe(1);
    expect(feedbackBoostFor("disliked", ["calm"], feedback)).toBe(-1);
  });

  it("aplica la mitad a los similares y nada a los distintos", () => {
    expect(feedbackBoostFor("other", ["energy"], feedback)).toBe(0.5);
    expect(feedbackBoostFor("other", ["sadness"], feedback)).toBe(0);
  });

  it("devuelve 0 sin valoraciones", () => {
    expect(feedbackBoostFor("a", ["joy"], undefined)).toBe(0);
    expect(feedbackBoostFor("a", ["joy"], new Map())).toBe(0);
  });
});
