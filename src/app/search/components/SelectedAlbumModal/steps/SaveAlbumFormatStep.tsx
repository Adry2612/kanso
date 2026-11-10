"use client";

import OptionSelector from "@/components/selectors/OptionSelector";
import { buildFormatOptions } from "@/components/selectors/formatOptions";
import type { OptionItem } from "@/components/selectors/types";
import {
  GENRE_KEYS,
  LANGUAGE_KEYS,
  normalizeGenreValue,
  normalizeLanguageValue,
} from "@/constants/taxonomy";
import { useTranslations } from "@/context/I18nContext";
import { normalizeTagCategory } from "@/utils/tags";
import type { CollectionFormat, CollectionTag } from "@/types/collection";

export type FormatStepView = "formats" | "tags";

interface SaveAlbumFormatStepProps {
  format: CollectionFormat[];
  tags: CollectionTag[];
  view: FormatStepView;
  onViewChange: (view: FormatStepView) => void;
  onFormatChange: (format: CollectionFormat[]) => void;
  onTagsChange: (tags: CollectionTag[]) => void;
}

/**
 * Paso 3 con dos secciones en el mismo paso: formato (obligatorio) e idioma y
 * género (opcional). Las secciones se cambian con un selector segmentado, así
 * que el pie siempre conserva «Atrás» y «Guardar»: no hay una navegación
 * anidada con su propio botón de volver.
 */
export function SaveAlbumFormatStep({
  format,
  tags,
  view,
  onViewChange,
  onFormatChange,
  onTagsChange,
}: SaveAlbumFormatStepProps) {
  const tTags = useTranslations("tags");
  const tFormats = useTranslations("formats");
  const tTaxonomy = useTranslations("taxonomy");
  const formatOptions = buildFormatOptions(tFormats, { includeAll: false });

  const languageTag = tags.find(
    (tag) => normalizeTagCategory(tag.category) === "idioma",
  );
  const genreTag = tags.find(
    (tag) => normalizeTagCategory(tag.category) === "género",
  );
  const languageValue = languageTag
    ? normalizeLanguageValue(languageTag.value)
    : null;
  const genreValue = genreTag ? normalizeGenreValue(genreTag.value) : null;

  const languageOptions: OptionItem[] = [
    { key: "none", label: tTags("noLanguage") },
    ...LANGUAGE_KEYS.map((key) => ({
      key,
      label: tTaxonomy(`languages.${key}`),
    })),
  ];

  const genreOptions: OptionItem[] = [
    { key: "none", label: tTags("noGenre") },
    ...GENRE_KEYS.map((key) => ({
      key,
      label: tTaxonomy(`genres.${key}`),
    })),
  ];

  const setLanguage = (key: string) => {
    const next = tags.filter(
      (tag) => normalizeTagCategory(tag.category) !== "idioma",
    );
    if (key !== "none") next.push({ category: "idioma", value: key });
    onTagsChange(next);
  };

  const setGenre = (key: string) => {
    const next = tags.filter(
      (tag) => normalizeTagCategory(tag.category) !== "género",
    );
    if (key !== "none") next.push({ category: "género", value: key });
    onTagsChange(next);
  };

  const toggleFormat = (item: string) => {
    const value = item as CollectionFormat;
    onFormatChange(
      format.includes(value)
        ? format.filter((current) => current !== value)
        : [...format, value],
    );
  };

  const summaryValue =
    [
      languageValue ? tTaxonomy(`languages.${languageValue}`) : null,
      genreValue ? tTaxonomy(`genres.${genreValue}`) : null,
    ]
      .filter(Boolean)
      .join(" · ") || tTags("summaryEmpty");

  const formatSummary = format.length
    ? `${format.length} formato${format.length === 1 ? "" : "s"}`
    : "Obligatorio";

  const tabClass = (active: boolean) =>
    `min-w-0 rounded-[var(--radius-xs)] px-2.5 py-2 text-left transition ${
      active
        ? "bg-[var(--kanso-mint)] text-[var(--background)]"
        : "text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        Paso 3
      </p>

      <div
        role="group"
        aria-label="Detalles de la colección"
        className="mt-3 grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] border border-[var(--kanso-line)] bg-[var(--surface-2)] p-1"
      >
        <button
          type="button"
          aria-pressed={view === "formats"}
          onClick={() => onViewChange("formats")}
          className={tabClass(view === "formats")}
        >
          <span className="block text-xs font-semibold">Formato</span>
          <span className="block truncate text-[10px] font-normal opacity-70">
            {formatSummary}
          </span>
        </button>
        <button
          type="button"
          aria-pressed={view === "tags"}
          onClick={() => onViewChange("tags")}
          className={tabClass(view === "tags")}
        >
          <span className="block text-xs font-semibold">Idioma y género</span>
          <span className="block truncate text-[10px] font-normal opacity-70">
            Opcional · {summaryValue}
          </span>
        </button>
      </div>

      {view === "formats" ? (
        <div className="mt-4">
          <h3 className="text-2xl font-semibold tracking-[-.04em] max-[380px]:text-xl">
            ¿Cómo forma parte de tu colección?
          </h3>
          <p className="album-action-modal-muted mt-1 text-sm">
            Elige uno o varios formatos.
          </p>
          <div className="mt-4">
            <OptionSelector
              options={formatOptions}
              selectedKeys={format}
              onSelect={toggleFormat}
              selection="multiple"
              layout="grid"
              semantics="buttons"
              ariaLabel="Formatos de la colección"
              columns={4}
              buttonClassName="save-album-modal-option"
            />
          </div>
          <p className="album-action-modal-muted mt-2 text-xs">
            {format.length
              ? `${format.length} formato${format.length === 1 ? "" : "s"} seleccionado${format.length === 1 ? "" : "s"}.`
              : "Selecciona al menos un formato para guardar el álbum."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold">
              {tTags("categories.language")}
            </h4>
            <div className="mt-2">
              <OptionSelector
                options={languageOptions}
                selectedKeys={[languageValue ?? "none"]}
                onSelect={setLanguage}
                selection="single"
                layout="carousel"
                semantics="buttons"
                ariaLabel={tTags("categories.language")}
              />
            </div>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold">
              {tTags("categories.genre")}
            </h4>
            <div className="mt-2">
              <OptionSelector
                options={genreOptions}
                selectedKeys={[genreValue ?? "none"]}
                onSelect={setGenre}
                selection="single"
                layout="carousel"
                semantics="buttons"
                ariaLabel={tTags("categories.genre")}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
