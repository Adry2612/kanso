"use client";

import OptionSelector from "@/components/selectors/OptionSelector";
import type { OptionItem } from "@/components/selectors/types";
import { activityOptions } from "@/constants/activities";
import { useTranslations } from "@/context/I18nContext";

interface SaveAlbumActivitiesStepProps {
  activities: string[];
  onActivitiesChange: (activities: string[]) => void;
}

/** Paso 2: actividades en las que se escucha el álbum. */
export function SaveAlbumActivitiesStep({
  activities,
  onActivitiesChange,
}: SaveAlbumActivitiesStepProps) {
  const tActivities = useTranslations("activities");

  const options: OptionItem[] = activityOptions.map(({ emoji, id }) => ({
    key: id,
    label: tActivities(id),
    emoji,
  }));

  const toggle = (activity: string) =>
    onActivitiesChange(
      activities.includes(activity)
        ? activities.filter((item) => item !== activity)
        : [...activities, activity],
    );

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
        Paso 2
      </p>
      <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
        ¿Cuándo lo escuchas?
      </h3>
      <p className="album-action-modal-muted mt-2 text-sm">
        Añade actividades para encontrarlo más fácilmente después.
      </p>
      <div className="mt-5">
        <OptionSelector
          options={options}
          selectedKeys={activities}
          onSelect={toggle}
          selection="multiple"
          layout="carousel"
          semantics="buttons"
          ariaLabel="Actividades"
          className="option-selector--activity"
          buttonClassName="save-album-modal-option"
        />
      </div>
      <p className="album-action-modal-muted mt-3 text-xs">
        {activities.length
          ? `${activities.length} actividad${activities.length === 1 ? "" : "es"} seleccionada${activities.length === 1 ? "" : "s"}`
          : "Puedes continuar sin seleccionar ninguna."}
      </p>
    </section>
  );
}
