import BaseModal from "./BaseModal";
import Medallion from "@/components/Medallion";
import { useTranslations } from "@/context/I18nContext";
import { MdMusicNote } from "react-icons/md";
import { FilterModalProps } from "@/types/components";
import { moodOptions } from "@/constants/moods";
import { useState } from "react";
import type { FavoriteFormat } from "@/types/favorites";

export default function FilterModal({
  isOpen,
  onClose,
  currentFilters,
  onFiltersChange,
}: FilterModalProps) {
  const t = useTranslations("modal");
  const tMoods = useTranslations("moods");
  const [tagCategory, setTagCategory] = useState("idioma");
  const [tagValue, setTagValue] = useState("");

  const moods = moodOptions.map((mood) => ({
    value: mood.key,
    label: tMoods(mood.key),
    emoji: mood.emoji,
  }));

  const genres = [
    { value: "rock", label: t("filter.genres.rock") },
    { value: "pop", label: t("filter.genres.pop") },
    { value: "jazz", label: t("filter.genres.jazz") },
    { value: "electronic", label: t("filter.genres.electronic") },
    { value: "classical", label: t("filter.genres.classical") },
    { value: "hip-hop", label: t("filter.genres.hiphop") },
  ];

  const formats: { value: FavoriteFormat; label: string; icon: string }[] = [
    { value: "digital", label: "Digital", icon: "▣" },
    { value: "cd", label: "CD", icon: "◉" },
    { value: "cassette", label: "Cassette", icon: "▤" },
    { value: "vinyl", label: "Vinilo", icon: "◍" },
  ];

  const toggleMood = (mood: string) => {
    const newMoods = currentFilters.moods.includes(mood)
      ? currentFilters.moods.filter((m) => m !== mood)
      : [...currentFilters.moods, mood];

    onFiltersChange({ ...currentFilters, moods: newMoods });
  };

  const toggleGenre = (genre: string) => {
    const newGenres = currentFilters.genres.includes(genre)
      ? currentFilters.genres.filter((g) => g !== genre)
      : [...currentFilters.genres, genre];

    onFiltersChange({ ...currentFilters, genres: newGenres });
  };

  const clearFilters = () => {
    onFiltersChange({ moods: [], genres: [], formats: [], tags: [] });
  };

  const toggleFormat = (format: FavoriteFormat) => {
    const newFormats = currentFilters.formats.includes(format)
      ? currentFilters.formats.filter((item) => item !== format)
      : [...currentFilters.formats, format];
    onFiltersChange({ ...currentFilters, formats: newFormats });
  };

  const hasActiveFilters =
    currentFilters.moods.length > 0 ||
    currentFilters.genres.length > 0 ||
    currentFilters.formats.length > 0 ||
    currentFilters.tags.length > 0;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("filter.title")}
      footer={
        hasActiveFilters && (
          <button onClick={clearFilters} className="modal-action-danger w-full">
            {t("filter.clearAll")}
          </button>
        )
      }
    >
      <div className="space-y-8">
        {/* Moods */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            {t("filter.moodsTitle")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {moods.map((mood) => {
              const isSelected = currentFilters.moods.includes(mood.value);

              return (
                <button
                  key={mood.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleMood(mood.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all ${
                    isSelected
                      ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                      : "border-[var(--kanso-line)] bg-[var(--surface-1)]/35 text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                  }`}
                >
                  <Medallion
                    emoji={mood.emoji}
                    size="sm"
                    onAccent={isSelected}
                  />
                  <span className="text-sm">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Genres */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            {t("filter.genresTitle")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => {
              const isSelected = currentFilters.genres.includes(genre.value);

              return (
                <button
                  key={genre.value}
                  onClick={() => toggleGenre(genre.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all ${
                    isSelected
                      ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                      : "border-[var(--kanso-line)] bg-[var(--surface-1)]/35 text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                  }`}
                >
                  <MdMusicNote size={18} />
                  <span className="text-sm">{genre.label}</span>
                  {isSelected && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            Formato de posesión
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((format) => {
              const isSelected = currentFilters.formats.includes(format.value);
              return (
                <button
                  key={format.value}
                  onClick={() => toggleFormat(format.value)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${isSelected ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]" : "border-[var(--kanso-line)] bg-[var(--surface-1)]/35 text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"}`}
                >
                  <span className="text-base">{format.icon}</span>
                  {format.label}
                  {isSelected && <span className="ml-auto text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            Etiquetas personales
          </h3>
          <div className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
            <input
              value={tagCategory}
              onChange={(event) => setTagCategory(event.target.value)}
              placeholder="Tag principal"
              className="kanso-input px-3 py-2 text-sm"
            />
            <input
              value={tagValue}
              onChange={(event) => setTagValue(event.target.value)}
              placeholder="Buscar subtag"
              className="kanso-input px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                const category = tagCategory.trim();
                const value = tagValue.trim();
                if (
                  category &&
                  value &&
                  !currentFilters.tags.some(
                    (tag) => tag.category === category && tag.value === value,
                  )
                ) {
                  onFiltersChange({
                    ...currentFilters,
                    tags: [...currentFilters.tags, { category, value }],
                  });
                  setTagValue("");
                }
              }}
              className="rounded-xl border border-[var(--kanso-line-strong)] px-3 py-2 text-sm text-[var(--kanso-mint)] hover:border-[var(--kanso-mint)]/60"
            >
              Aplicar
            </button>
          </div>
          {currentFilters.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {currentFilters.tags.map((tag) => (
                <button
                  key={`${tag.category}-${tag.value}`}
                  type="button"
                  onClick={() =>
                    onFiltersChange({
                      ...currentFilters,
                      tags: currentFilters.tags.filter(
                        (item) =>
                          item.category !== tag.category ||
                          item.value !== tag.value,
                      ),
                    })
                  }
                  className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
                >
                  {tag.category}: {tag.value} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
