"use client";

import React from "react";
import { useTranslations } from "@/context/I18nContext";
import { normalizeTagCategory, tagKey } from "@/lib/tags";

export interface Tag {
  category: string;
  value: string;
}

interface TagListProps {
  tags?: Tag[];
  showCategory?: boolean;
}

export const TagList: React.FC<TagListProps> = ({
  tags = [],
  showCategory = false,
}) => {
  const t = useTranslations("tags");

  if (!tags || tags.length === 0) return null;

  const categoryLabel = (category: string) => {
    const normalized = normalizeTagCategory(category);
    if (normalized === "idioma") return t("categories.language");
    if (normalized === "género") return t("categories.genre");
    return t("categories.other");
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tagKey(tag)}
          className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
        >
          {showCategory && (
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[.08em] opacity-60">
              {categoryLabel(tag.category)}:
            </span>
          )}
          {tag.value}
        </span>
      ))}
    </div>
  );
};

export default TagList;
