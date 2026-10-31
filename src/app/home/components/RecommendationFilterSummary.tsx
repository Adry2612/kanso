"use client";

import { tagDisplayLabel } from "@/constants/taxonomy";
import { useTranslations } from "@/context/I18nContext";
import { tagCategoryI18nKey } from "@/utils/collection";

type RecommendationFilterSummaryProps = {
  /** Formato elegido en la recomendación rápida. */
  format: string;
  /** Etiquetas elegidas, con el formato `categoría:valor`. */
  tags: string[];
};

const FORMAT_KEYS = new Set(["all", "digital", "vinyl", "cd", "cassette"]);

function parseTag(tag: string): { category: string; value: string } {
  const separator = tag.indexOf(":");
  if (separator === -1) return { category: "otra", value: tag };
  return {
    category: tag.slice(0, separator),
    value: tag.slice(separator + 1),
  };
}

/**
 * Fila discreta con el formato y las etiquetas que se usaron para pedir una
 * recomendación rápida. No se muestra en los flujos por emoción o actividad.
 */
export default function RecommendationFilterSummary({
  format,
  tags,
}: RecommendationFilterSummaryProps) {
  const tQuick = useTranslations("quickRecommendation");
  const tFormats = useTranslations("formats");
  const tTags = useTranslations("tags");
  const tTaxonomy = useTranslations("taxonomy");
  const formatLabel = tFormats(FORMAT_KEYS.has(format) ? format : "all");

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        {tQuick("filtersLabel")}
      </span>
      <ul
        aria-label={tQuick("filtersLabel")}
        className="flex flex-wrap items-center gap-2"
      >
        <li>
          <span className="inline-flex rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--kanso-muted)]">
            {formatLabel}
          </span>
        </li>
        {tags.map((tag) => {
          const { category, value } = parseTag(tag);
          return (
            <li key={tag}>
              <span className="inline-flex rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1 text-xs text-[var(--kanso-muted)]">
                {tTags(tagCategoryI18nKey(category))}:{" "}
                {tagDisplayLabel({ category, value }, tTaxonomy)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
