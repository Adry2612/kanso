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

interface SaveAlbumFormatStepProps {
  format: CollectionFormat[];
  tags: CollectionTag[];
  onFormatChange: (format: CollectionFormat[]) => void;
  onTagsChange: (tags: CollectionTag[]) => void;
}

/** Paso 3: formatos de la colección, idioma y género. */
export function SaveAlbumFormatStep({
  format,
  tags,
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

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        Paso 3
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
        ¿Cómo forma parte de tu colección?
      </h3>
      <p className="album-action-modal-muted mt-2 text-sm">
        Elige uno o varios formatos para asociar a este álbum.
      </p>
      <div className="mt-5">
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
      <p className="album-action-modal-muted mt-3 text-xs">
        {format.length
          ? `${format.length} formato${format.length === 1 ? "" : "s"} seleccionado${format.length === 1 ? "" : "s"}.`
          : "Selecciona al menos un formato para guardar el álbum."}
      </p>

      <div className="mt-6 space-y-6 border-t border-[var(--kanso-line)] pt-5">
        <div>
          <h4 className="text-sm font-semibold">
            {tTags("categories.language")}
          </h4>
          <p className="album-action-modal-muted mt-1 text-xs">
            {tTags("languageHelp")}
          </p>
          <div className="mt-3">
            <OptionSelector
              options={languageOptions}
              selectedKeys={[languageValue ?? "none"]}
              onSelect={setLanguage}
              selection="single"
              layout="grid"
              semantics="buttons"
              ariaLabel={tTags("categories.language")}
              columns={4}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">{tTags("categories.genre")}</h4>
          <p className="album-action-modal-muted mt-1 text-xs">
            {tTags("genreHelp")}
          </p>
          <div className="mt-3">
            <OptionSelector
              options={genreOptions}
              selectedKeys={[genreValue ?? "none"]}
              onSelect={setGenre}
              selection="single"
              layout="grid"
              semantics="buttons"
              ariaLabel={tTags("categories.genre")}
              columns={4}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
