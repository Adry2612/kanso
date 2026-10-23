"use client";

import Medallion from "@/components/Medallion";
import OptionCarousel from "@/components/OptionCarousel";
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
        <OptionCarousel ariaLabel="Actividades" className="activity-carousel">
          {activityOptions.map(({ emoji, id: activity }) => {
            const selected = activities.includes(activity);
            return (
              <button
                key={activity}
                type="button"
                data-selected={selected}
                aria-pressed={selected}
                onClick={() => toggle(activity)}
                className="save-album-modal-option flex items-center gap-3 rounded-xl p-3 text-left transition"
              >
                <Medallion emoji={emoji} size="sm" onAccent={selected} />
                <span className="text-xs font-semibold">
                  {tActivities(activity)}
                </span>
              </button>
            );
          })}
        </OptionCarousel>
      </div>
      <p className="album-action-modal-muted mt-3 text-xs">
        {activities.length
          ? `${activities.length} actividad${activities.length === 1 ? "" : "es"} seleccionada${activities.length === 1 ? "" : "s"}`
          : "Puedes continuar sin seleccionar ninguna."}
      </p>
    </section>
  );
}
