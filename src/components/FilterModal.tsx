import BaseModal from "./BaseModal";
import Medallion from "@/components/Medallion";
import OptionSelector from "@/components/selectors/OptionSelector";
import { buildFormatOptions } from "@/components/selectors/formatOptions";
import { useTranslations } from "@/context/I18nContext";
import { MdMusicNote } from "react-icons/md";
import { FilterModalProps } from "@/types/components";
import { moodOptions } from "@/constants/moods";
import type {
  CollectionFormat,
  CollectionGroupBy,
  CollectionTag,
} from "@/types/collection";
import {
  normalizeTagCategory,
  TAG_CATEGORIES,
  tagKey,
  uniqueTags,
} from "@/lib/tags";
import { GENRE_BRANCHES, genreBranchLabelKey } from "@/utils/genres";

export default function FilterModal({
  isOpen,
  onClose,
  currentFilters,
  onFiltersChange,
  availableTags = [],
}: FilterModalProps) {
  const t = useTranslations("modal");
  const tMoods = useTranslations("moods");
  const tTags = useTranslations("tags");
  const tFormats = useTranslations("formats");

  const moods = moodOptions.map((mood) => ({
    value: mood.key,
    label: tMoods(mood.key),
    emoji: mood.emoji,
  }));

  const genres = GENRE_BRANCHES.map((branch) => ({
    value: branch,
    label: t(`filter.genres.${genreBranchLabelKey(branch)}`),
  }));

  const formatOptions = buildFormatOptions(tFormats, { includeAll: false });

  const collectionTags = uniqueTags(availableTags);
  const tagGroups = [
    ...TAG_CATEGORIES.map((category) => ({
      category,
      label:
        category === "idioma"
          ? tTags("categories.language")
          : tTags("categories.genre"),
      tags: collectionTags.filter(
        (tag) => normalizeTagCategory(tag.category) === category,
      ),
    })),
    {
      category: "otras",
      label: tTags("categories.other"),
      tags: collectionTags.filter(
        (tag) =>
          !TAG_CATEGORIES.includes(
            normalizeTagCategory(tag.category) as "idioma" | "género",
          ),
      ),
    },
  ].filter((group) => group.tags.length > 0);

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
    onFiltersChange({
      groupBy: "none",
      incompleteOnly: false,
      moods: [],
      genres: [],
      formats: [],
      tags: [],
    });
  };

  const toggleFormat = (format: CollectionFormat) => {
    const newFormats = currentFilters.formats.includes(format)
      ? currentFilters.formats.filter((item) => item !== format)
      : [...currentFilters.formats, format];
    onFiltersChange({ ...currentFilters, formats: newFormats });
  };

  const toggleTag = (tag: CollectionTag) => {
    const isSelected = currentFilters.tags.some(
      (item) => tagKey(item) === tagKey(tag),
    );
    onFiltersChange({
      ...currentFilters,
      tags: isSelected
        ? currentFilters.tags.filter((item) => tagKey(item) !== tagKey(tag))
        : [...currentFilters.tags, tag],
    });
  };

  const groupOptions: { value: CollectionGroupBy; label: string }[] = [
    { value: "none", label: t("filter.group.none") },
    { value: "date", label: t("filter.group.date") },
    { value: "artist", label: t("filter.group.artist") },
    { value: "letter", label: t("filter.group.letter") },
    { value: "year", label: t("filter.group.year") },
  ];

  const hasActiveFilters =
    currentFilters.groupBy !== "none" ||
    currentFilters.incompleteOnly ||
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
          <OptionSelector
            options={formatOptions}
            selectedKeys={currentFilters.formats}
            onSelect={(key) => toggleFormat(key as CollectionFormat)}
            selection="multiple"
            layout="grid"
            semantics="buttons"
            ariaLabel="Formato de posesión"
            columns={2}
          />
        </div>
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            {tTags("filterTitle")}
          </h3>
          {tagGroups.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--kanso-line)] p-4 text-sm leading-relaxed text-[var(--kanso-muted)]">
              {tTags("filterEmpty")}
            </p>
          ) : (
            <div className="space-y-4">
              {tagGroups.map((group) => (
                <div key={group.category}>
                  <p className="mb-2 text-xs font-semibold text-[var(--kanso-muted)]">
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.tags.map((tag) => {
                      const isSelected = currentFilters.tags.some(
                        (item) => tagKey(item) === tagKey(tag),
                      );
                      return (
                        <button
                          key={tagKey(tag)}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => toggleTag(tag)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                            isSelected
                              ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                              : "border-[var(--kanso-line)] bg-[var(--surface-1)]/35 text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                          }`}
                        >
                          {tag.value}
                          {isSelected && <span aria-hidden="true">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grouping */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            {t("filter.groupTitle")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {groupOptions.map((option) => {
              const isSelected = currentFilters.groupBy === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    onFiltersChange({
                      ...currentFilters,
                      groupBy: option.value,
                    })
                  }
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                      : "border-[var(--kanso-line)] bg-[var(--surface-1)]/35 text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            {t("filter.statusTitle")}
          </h3>
          <button
            type="button"
            aria-pressed={currentFilters.incompleteOnly}
            onClick={() =>
              onFiltersChange({
                ...currentFilters,
                incompleteOnly: !currentFilters.incompleteOnly,
              })
            }
            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
              currentFilters.incompleteOnly
                ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)] text-[var(--background)]"
                : "border-[var(--kanso-line)] bg-[var(--surface-1)]/35 text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50"
            }`}
          >
            <span>{t("filter.incomplete")}</span>
            <span aria-hidden="true">
              {currentFilters.incompleteOnly ? "✓" : ""}
            </span>
          </button>
          <p className="mt-2 text-xs leading-relaxed text-[var(--kanso-muted)]">
            {t("filter.incompleteDescription")}
          </p>
        </div>
      </div>
    </BaseModal>
  );
}
