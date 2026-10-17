import React from "react";

export interface Tag {
  category: string;
  value: string;
}

interface TagListProps {
  tags?: Tag[];
  showCategory?: boolean; // Opcional: por si quieres mostrar la categoría (ej: "Género: Rock")
}

// Función auxiliar para capitalizar (Primera mayúscula, resto minúsculas)
const capitalize = (text: string) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const TagList: React.FC<TagListProps> = ({
  tags = [],
  showCategory = false,
}) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={`${tag.category}-${tag.value}`}
          className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)]"
        >
          {showCategory && (
            <span className="mr-1 opacity-60">{capitalize(tag.category)}:</span>
          )}
          {capitalize(tag.value)}
        </span>
      ))}
    </div>
  );
};

export default TagList;
