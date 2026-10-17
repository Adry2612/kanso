"use client";

import { activityOptions } from "@/constants/activities";
import { getMood, moodFamilies } from "@/constants/moods";
import { useTranslations } from "@/context/I18nContext";

export type MoodPickerMode = "mood" | "activity";

type MoodSelectorProps = {
  /** Qué catálogo se muestra. */
  mode?: MoodPickerMode;
  /** Claves seleccionadas (no etiquetas ni objetos). */
  selected: string[];
  /** Devuelve el array completo de claves seleccionadas tras el cambio. */
  onChange: (keys: string[]) => void;
  /** Nombre accesible del grupo. */
  label?: string;
  size?: "md" | "sm";
  className?: string;
};

type PickerOption = { key: string; label: string; emoji: string };
type PickerGroup = {
  id: string;
  label: string | null;
  options: PickerOption[];
};

/**
 * Selector de emociones o actividades.
 *
 * Muestra todas las opciones a la vez (sin paginar ni carrusel), agrupadas por
 * familias, y resume la selección en el propio control. Es el mismo componente
 * en el inicio, en el filtro de la colección y en el modal de guardar álbum.
 */
export default function MoodSelector({
  mode = "mood",
  selected,
  onChange,
  label,
  size = "md",
  className = "",
}: MoodSelectorProps) {
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tGroups = useTranslations("moodGroups");

  const groups: PickerGroup[] =
    mode === "mood"
      ? moodFamilies.map((family) => ({
          id: family.id,
          label: tGroups(family.id),
          options: family.keys.flatMap((key) => {
            const mood = getMood(key);
            return mood
              ? [{ key, label: tMoods(mood.key), emoji: mood.emoji }]
              : [];
          }),
        }))
      : [
          {
            id: "activity",
            label: null,
            options: activityOptions.map((activity) => ({
              key: activity.id,
              label: tActivities(activity.id),
              emoji: activity.emoji,
            })),
          },
        ];

  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((item) => item !== key)
        : [...selected, key],
    );
  };

  const tileSize =
    size === "sm"
      ? "gap-1.5 px-2.5 py-1.5 text-xs"
      : "gap-2 px-3.5 py-2 text-sm";

  return (
    <div className={`grid gap-5 ${className}`} role="group" aria-label={label}>
      {groups.map((group) => (
        <div key={group.id}>
          {group.label && (
            <p className="mb-2 text-xs font-semibold text-[var(--collectify-muted)]">
              {group.label}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const isSelected = selected.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggle(option.key)}
                  className={`inline-flex items-center rounded-full border font-semibold transition motion-reduce:transition-none active:scale-[0.97] motion-reduce:active:scale-100 ${tileSize} ${
                    isSelected
                      ? "border-[var(--collectify-mint)] bg-[var(--collectify-mint)] text-[var(--background)]"
                      : "border-[var(--collectify-line)] bg-[var(--surface-1)]/40 text-[var(--foreground)] hover:border-[var(--collectify-mint)]/60 hover:bg-[var(--surface-3)]"
                  }`}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {option.emoji}
                  </span>
                  <span>{option.label}</span>
                  {isSelected && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
