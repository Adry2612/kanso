"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { useLocale, useTranslations } from "@/context/I18nContext";
import type { FavoriteTag } from "@/types/favorites";
import {
  normalizeTagCategory,
  TAG_CATEGORIES,
  TAG_SUGGESTIONS,
  tagKey,
  uniqueTags,
  type TagCategory,
} from "@/lib/tags";

interface TagEditorProps {
  tags: FavoriteTag[];
  onChange: (tags: FavoriteTag[]) => void;
}

/**
 * Editor de etiquetas centrado en los dos ejes que usa la colección: idioma y
 * género. Las etiquetas antiguas de otras categorías se conservan y se pueden
 * eliminar, pero ya no se ofrecen al añadir.
 */
export default function TagEditor({ tags, onChange }: TagEditorProps) {
  const t = useTranslations("tags");
  const locale = useLocale();
  const [category, setCategory] = useState<TagCategory>("idioma");
  const [customValue, setCustomValue] = useState("");

  const suggestions = TAG_SUGGESTIONS[locale][category];

  const isSelected = (value: string) =>
    tags.some(
      (tag) =>
        normalizeTagCategory(tag.category) === category &&
        tag.value.trim().toLowerCase() === value.trim().toLowerCase(),
    );

  const toggleValue = (value: string) => {
    if (isSelected(value)) {
      onChange(
        tags.filter(
          (tag) =>
            !(
              normalizeTagCategory(tag.category) === category &&
              tag.value.trim().toLowerCase() === value.trim().toLowerCase()
            ),
        ),
      );
      return;
    }
    onChange([...tags, { category, value }]);
  };

  const addCustom = () => {
    const value = customValue.trim();
    if (!value || isSelected(value)) return;
    onChange([...tags, { category, value }]);
    setCustomValue("");
  };

  const categoryLabel = (value: string) => {
    const normalized = normalizeTagCategory(value);
    if (normalized === "idioma") return t("categories.language");
    if (normalized === "género") return t("categories.genre");
    return t("categories.other");
  };

  const selectedTags = uniqueTags(tags);

  return (
    <div>
      <div
        role="group"
        aria-label={t("title")}
        className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/50 p-1"
      >
        {TAG_CATEGORIES.map((option) => {
          const isActive = category === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setCategory(option);
                setCustomValue("");
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-[var(--kanso-mint)] text-[var(--background)]"
                  : "text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {option === "idioma"
                ? t("categories.language")
                : t("categories.genre")}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((value) => {
          const selected = isSelected(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleValue(value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected
                  ? "border-[var(--kanso-mint)]/60 bg-[var(--kanso-mint)]/15 text-[var(--kanso-mint)]"
                  : "border-[var(--kanso-line)] text-[var(--kanso-muted)] hover:border-[var(--kanso-mint)]/50 hover:text-[var(--foreground)]"
              }`}
            >
              {selected && (
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              )}
              {value}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          maxLength={32}
          placeholder={t("customPlaceholder")}
          className="kanso-input min-w-0 flex-1 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customValue.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--kanso-line-strong)] px-3 py-2 text-sm font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t("add")}
        </button>
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[var(--kanso-muted)]">
            {t("selected")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tagKey(tag)}
                type="button"
                onClick={() =>
                  onChange(tags.filter((item) => tagKey(item) !== tagKey(tag)))
                }
                aria-label={t("remove").replace(
                  "{tag}",
                  `${categoryLabel(tag.category)}: ${tag.value}`,
                )}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--kanso-line)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)] transition hover:border-[var(--kanso-danger)]/40 hover:text-[var(--kanso-danger)]"
              >
                <span className="opacity-60">
                  {categoryLabel(tag.category)}:
                </span>
                {tag.value}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
