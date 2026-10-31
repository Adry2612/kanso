import { describe, expect, it } from "vitest";
import {
  buildQuickRecommendationHref,
  buildRecommendationHref,
} from "./recommendationParams";

describe("buildRecommendationHref", () => {
  it("conserva emociones, actividad, formato y etiquetas", () => {
    const href = buildRecommendationHref({
      format: "vinyl",
      activities: ["party"],
      tags: ["género:rock"],
    });
    const params = new URLSearchParams(href.split("?")[1]);

    expect(params.get("format")).toBe("vinyl");
    expect(params.get("activity")).toBe("party");
    expect(params.get("tag")).toBe("género:rock");
    expect(params.get("type")).toBe("activity");
    expect(params.has("includePending")).toBe(false);
  });

  it("usa type=mood cuando no hay actividad", () => {
    const href = buildRecommendationHref({
      format: "all",
      moods: ["joy"],
    });
    const params = new URLSearchParams(href.split("?")[1]);

    expect(params.get("type")).toBe("mood");
    expect(params.get("mood")).toBeNull();
    expect(params.getAll("moods")).toEqual(["joy"]);
  });
});

describe("buildQuickRecommendationHref", () => {
  it("marca la vía rápida sin pedir emoción", () => {
    const href = buildQuickRecommendationHref("all", null);

    expect(href).toContain("quick=1");
    expect(href).not.toContain("includePending");
    expect(href).not.toContain("moods=");
  });
});
