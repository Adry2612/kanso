"use client";

import TagEditor from "@/components/TagEditor";
import { useTranslations } from "@/context/I18nContext";
import type { FavoriteFormat, FavoriteTag } from "@/types/favorites";

const FORMATS: FavoriteFormat[] = ["digital", "vinyl", "cd", "cassette"];

const FORMAT_LABELS: Record<FavoriteFormat, string> = {
  digital: "Digital",
  vinyl: "Vinilo",
  cd: "CD",
  cassette: "Cassette",
};

interface SaveAlbumFormatStepProps {
  format: FavoriteFormat[];
  tags: FavoriteTag[];
  onFormatChange: (format: FavoriteFormat[]) => void;
  onTagsChange: (tags: FavoriteTag[]) => void;
}

/** Paso 3: formatos de la colección y etiquetas. */
export function SaveAlbumFormatStep({
  format,
  tags,
  onFormatChange,
  onTagsChange,
}: SaveAlbumFormatStepProps) {
  const tTags = useTranslations("tags");

  const toggleFormat = (item: FavoriteFormat) =>
    onFormatChange(
      format.includes(item)
        ? format.filter((value) => value !== item)
        : [...format, item],
    );

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
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FORMATS.map((item) => {
          const selected = format.includes(item);
          return (
            <button
              key={item}
              type="button"
              data-selected={selected}
              onClick={() => toggleFormat(item)}
              className="save-album-modal-option rounded-xl px-3 py-4 text-center text-sm transition"
            >
              {FORMAT_LABELS[item]}
            </button>
          );
        })}
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
