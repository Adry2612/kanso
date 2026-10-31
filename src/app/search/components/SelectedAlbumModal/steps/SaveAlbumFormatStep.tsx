"use client";

import TagEditor from "@/components/TagEditor";
import OptionSelector from "@/components/selectors/OptionSelector";
import { buildFormatOptions } from "@/components/selectors/formatOptions";
import { useTranslations } from "@/context/I18nContext";
import type { CollectionFormat, CollectionTag } from "@/types/collection";

interface SaveAlbumFormatStepProps {
  format: CollectionFormat[];
  tags: CollectionTag[];
  onFormatChange: (format: CollectionFormat[]) => void;
  onTagsChange: (tags: CollectionTag[]) => void;
}

/** Paso 3: formatos de la colección y etiquetas. */
export function SaveAlbumFormatStep({
  format,
  tags,
  onFormatChange,
  onTagsChange,
}: SaveAlbumFormatStepProps) {
  const tTags = useTranslations("tags");
  const tFormats = useTranslations("formats");
  const options = buildFormatOptions(tFormats, { includeAll: false });

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
          options={options}
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

      <div className="mt-6 border-t border-[var(--kanso-line)] pt-5">
        <h4 className="text-sm font-semibold">{tTags("title")}</h4>
        <p className="album-action-modal-muted mt-1 text-xs">
          {tTags("description")}
        </p>
        <div className="mt-3">
          <TagEditor tags={tags} onChange={onTagsChange} />
        </div>
      </div>
    </section>
  );
}
