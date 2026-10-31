"use client";

import InlineEmoji from "@/components/InlineEmoji";
import TagList from "@/components/TagList";
import { getActivity } from "@/constants/activities";
import { getMood, normalizeMoods } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";
import { normalizeCollectionFormats } from "@/utils/formats";
import type { CollectionFormat, CollectionTag } from "@/types/collection";

type AlbumRecordPanelProps = {
  moods: string[];
  activities?: string[];
  formats?: string | string[];
  tags?: CollectionTag[];
  /** Id del encabezado; permite etiquetar el aside en cada pantalla. */
  titleId?: string;
};

/**
 * Panel «Mi disco» compartido por el detalle de un álbum de la colección y el
 * resultado de una recomendación. Solo pinta las secciones con datos.
 */
export default function AlbumRecordPanel({
  moods,
  activities = [],
  formats,
  tags = [],
  titleId = "album-record-title",
}: AlbumRecordPanelProps) {
  const t = useTranslations("album");
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tTags = useTranslations("tags");

  const normalizedMoods = normalizeMoods(moods);
  const normalizedFormats: CollectionFormat[] =
    normalizeCollectionFormats(formats);
  const savedActivities = activities.filter(
    (activity): activity is string => typeof activity === "string",
  );

  const formatLabel = (format: CollectionFormat) => {
    const keys: Record<CollectionFormat, string> = {
      digital: "formatDigital",
      vinyl: "formatVinyl",
      cd: "formatCd",
      cassette: "formatCassette",
    };
    return t(keys[format]);
  };

  const isEmpty =
    normalizedMoods.length === 0 &&
    savedActivities.length === 0 &&
    normalizedFormats.length === 0 &&
    tags.length === 0;

  return (
    <aside
      aria-labelledby={titleId}
      className="order-first xl:order-none xl:sticky xl:top-8"
    >
      <p
        id={titleId}
        className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-muted)]"
      >
        {t("myRecord")}
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
        {normalizedMoods.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
              {t("emotions")}
            </p>
            <div className="flex flex-wrap gap-2">
              {normalizedMoods.map((mood) => {
                const item = getMood(mood);
                return (
                  <span
                    key={mood}
                    className="rounded-full bg-[var(--kanso-mint)]/10 px-3 py-1.5 text-xs text-[var(--kanso-mint)]"
                  >
                    <InlineEmoji emoji={item?.emoji} />
                    {tMoods(mood)}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {savedActivities.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
              {t("activities")}
            </p>
            <div className="flex flex-wrap gap-2">
              {savedActivities.map((activity) => (
                <span
                  key={activity}
                  className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                >
                  <InlineEmoji emoji={getActivity(activity)?.emoji} />
                  {tActivities(activity)}
                </span>
              ))}
            </div>
          </section>
        )}

        {normalizedFormats.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
              {t("format")}
            </p>
            <div className="flex flex-wrap gap-2">
              {normalizedFormats.map((format) => (
                <span
                  key={format}
                  className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                >
                  {formatLabel(format)}
                </span>
              ))}
            </div>
          </section>
        )}

        {tags.length > 0 && (
          <section>
            <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
              {tTags("title")}
            </p>
            <TagList tags={tags} showCategory />
          </section>
        )}

        {isEmpty && (
          <p className="text-xs text-[var(--kanso-muted)]">
            {t("recordSummaryEmpty")}
          </p>
        )}
      </div>
    </aside>
  );
}
