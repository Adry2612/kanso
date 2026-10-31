"use client";

import { useTranslations } from "@/context/I18nContext";
import { getMood } from "@/constants/moods";
import { tagCategoryI18nKey } from "@/utils/collection";
import type {
  RecommendationExplanation,
  RecommendationScoreBreakdown,
} from "@/types/recommendations";

type RecommendationExplainProps = {
  explain: RecommendationExplanation;
};

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function decimal(value: number): string {
  return value.toFixed(2);
}

function parseTag(tag: string): { category: string; value: string } {
  const separator = tag.indexOf(":");
  if (separator === -1) return { category: "otra", value: tag };
  return {
    category: tag.slice(0, separator),
    value: tag.slice(separator + 1),
  };
}

/**
 * Herramienta de desarrollo con el desglose de la recomendación.
 *
 * Solo se monta desde el resultado cuando `NEXT_PUBLIC_RECOMMENDATION_DEBUG`
 * vale `true`; el componente en sí no decide la visibilidad.
 */
export default function RecommendationExplain({
  explain,
}: RecommendationExplainProps) {
  const t = useTranslations("recommendationExplain");
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tTags = useTranslations("tags");

  const formatLabel = (value: string) => {
    const known = ["all", "digital", "vinyl", "cd", "cassette"];
    return known.includes(value) ? t(`formats.${value}`) : value;
  };

  const moodLabel = (mood: string) => tMoods(getMood(mood)?.key ?? mood);

  const scoreRows: Array<{
    key: keyof RecommendationScoreBreakdown;
    label: string;
    format: (value: number) => string;
  }> = [
    {
      key: "labelOverlap",
      label: t("score.labelOverlap"),
      format: percent,
    },
    {
      key: "baseScore",
      label: t("score.baseScore"),
      format: decimal,
    },
    {
      key: "recencyPenalty",
      label: t("score.recencyPenalty"),
      format: (value) =>
        value === 0 ? "−0.00" : `−${decimal(explain.weights.recent * value)}`,
    },
    {
      key: "feedbackBoost",
      label: t("score.feedbackBoost"),
      format: (value) => {
        const weighted = explain.weights.feedback * value;
        return weighted > 0 ? `+${decimal(weighted)}` : decimal(weighted);
      },
    },
    {
      key: "finalScore",
      label: t("score.finalScore"),
      format: decimal,
    },
  ];

  return (
    <details className="mb-6 min-w-0 rounded-[var(--radius-md)] border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 px-4 py-3 text-xs text-[var(--kanso-muted)]">
      <summary className="cursor-pointer select-none text-[11px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        {t("title")}
      </summary>

      <div className="mt-4 space-y-4">
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--foreground)]">
            {t("filters")}
          </h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {explain.filters.moods.map((mood) => (
              <li
                key={`mood-${mood}`}
                className="rounded-full border border-[var(--kanso-line)] px-2.5 py-1"
              >
                {t("mood")}: {moodLabel(mood)}
              </li>
            ))}
            {explain.filters.activity && (
              <li className="rounded-full border border-[var(--kanso-line)] px-2.5 py-1">
                {t("activity")}: {tActivities(explain.filters.activity)}
              </li>
            )}
            <li className="rounded-full border border-[var(--kanso-line)] px-2.5 py-1">
              {t("format")}: {formatLabel(explain.filters.format)}
            </li>
            {explain.filters.tags.map((tag) => {
              const { category, value } = parseTag(tag);
              return (
                <li
                  key={`tag-${tag}`}
                  className="rounded-full border border-[var(--kanso-line)] px-2.5 py-1"
                >
                  {tTags(tagCategoryI18nKey(category))}: {value}
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--foreground)]">
            {t("candidates")}
          </h3>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              {t("collection")}: {explain.counts.collection}
            </span>
            <span>
              {t("afterFilters")}: {explain.counts.afterFilters}
            </span>
          </p>
        </section>

        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--foreground)]">
            {t("selected")}
          </h3>
          <p className="mt-2 break-words text-[var(--foreground)]">
            {explain.selected.albumName}
          </p>
          {explain.selected.matchingMoods.length > 0 && (
            <p className="mt-1 break-words">
              {t("matchingMoods")}:{" "}
              {explain.selected.matchingMoods.map(moodLabel).join(", ")}
            </p>
          )}
          <dl className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {scoreRows.map((row) => (
              <div
                key={row.key}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--kanso-line)]/60 pb-1"
              >
                <dt>{row.label}</dt>
                <dd className="font-mono text-[var(--foreground)]">
                  {row.format(explain.selected.score[row.key])}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-[10px] leading-relaxed">
            {t("formula")}: {t("formulaMatch")} − {explain.weights.recent} ×{" "}
            {t("formulaRecency")} + {explain.weights.feedback} ×{" "}
            {t("formulaFeedback")}
          </p>
          <p className="mt-1 text-[10px] leading-relaxed">{t("scoreHelp")}</p>
        </section>

        {explain.alternatives.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--foreground)]">
              {t("alternatives")}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {explain.alternatives.map((candidate) => (
                <li
                  key={candidate.albumId}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-[var(--kanso-line)]/60 pb-1"
                >
                  <span className="min-w-0 break-words">
                    {candidate.albumName}
                  </span>
                  <span className="font-mono text-[var(--foreground)]">
                    {decimal(candidate.score.finalScore)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </details>
  );
}
