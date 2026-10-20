/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import MoodSelector from "@/components/MoodSelector";
import { useAuth } from "@/context/AuthContext";
import { Album } from "../../../../../../models/album";
import { useFetch } from "@/hooks/useFetch";
import { addFavorite } from "@/lib/api/favorites";
import { useTranslations } from "@/context/I18nContext";
import { FavoriteFormat, FavoriteTag } from "@/types/favorites";
import ArtistBackdrop from "./ArtistBackdrop";
import ModalShell from "@/components/ModalShell";
import Medallion from "@/components/Medallion";
import TagEditor from "@/components/TagEditor";
import OptionCarousel from "@/components/OptionCarousel";
import { activityOptions } from "@/constants/activities";
import { AnimatePresence, EASE_OUT, motion } from "@/components/motion";

type SaveAlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onSave: (favoriteData?: any) => void;
  feelings: Array<any>;
  setFeelings: React.Dispatch<React.SetStateAction<Array<any>>>;
  initialFeelings?: Array<any>;
  initialActivities?: string[];
  initialFormat?: FavoriteFormat[];
  initialTags?: FavoriteTag[];
  isEditing?: boolean;
};

const steps = ["Sensaciones", "Actividades", "Formato"];

export const SaveAlbumModal = ({
  isOpen,
  onClose,
  album,
  onSave,
  feelings,
  setFeelings,
  initialFeelings = [],
  initialActivities = [],
  initialFormat = ["digital"],
  initialTags = [],
  isEditing = false,
}: SaveAlbumModalProps) => {
  const t = useTranslations("modal");
  const tTags = useTranslations("tags");
  const tActivities = useTranslations("activities");
  const { user } = useAuth();
  const { execute: saveFavorite, loading, error } = useFetch(addFavorite);
  const [step, setStep] = useState(0);
  const [activities, setActivities] = useState<string[]>([]);
  const [format, setFormat] = useState<FavoriteFormat[]>(["digital"]);
  const [tags, setTags] = useState<FavoriteTag[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setFeelings(initialFeelings);
    setActivities(initialActivities);
    setFormat(initialFormat);
    setTags(initialTags);
    // Resetear con los valores initial* borraría las ediciones en curso del modal;
    // solo debe re-inicializarse al abrirse o al cambiar de álbum.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, album.id]);

  // Cada paso empieza arriba: en móvil el contenido es más alto que el panel.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const save = async () => {
    if (!user?.uid) return;
    const result = await saveFavorite(
      album,
      user,
      feelings,
      format,
      activities,
      tags,
    );
    if (result !== null)
      onSave({
        albumId: album.id,
        labeledFeelings: result.feelings,
        activities,
        format,
        tags,
      });
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="save-album-modal-shell"
      labelledBy="save-album-title"
      closeLabel={t("close")}
    >
      <div className="save-album-modal-split">
        <aside className="save-album-modal-aside">
          <div className="save-album-modal-aside-media">
            <ArtistBackdrop
              artistId={album.artists[0]?.id}
              artistName={album.artists[0]?.name}
            />
          </div>
          <div className="save-album-modal-aside-content">
            <span className="modal-shell-hero-badge self-start">
              {isEditing ? t("editingBadge") : t("newAlbum")}
            </span>
            <div className="save-album-modal-identity mt-auto">
              <img
                loading="lazy"
                decoding="async"
                src={album.images[0]?.url}
                alt={album.name}
                className="save-album-modal-cover"
              />
              <div className="min-w-0">
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
                  Álbum
                </p>
                <h2
                  id="save-album-title"
                  className="mt-1 line-clamp-2 text-2xl font-semibold tracking-[-.05em]"
                >
                  {album.name}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-white/70">
                  {album.artists.map((artist: any) => artist.name).join(", ")}
                </p>
              </div>
            </div>
            <ol className="save-album-modal-steps" aria-label="Pasos">
              {steps.map((label, index) => (
                <li
                  key={label}
                  data-state={
                    index < step
                      ? "done"
                      : index === step
                        ? "active"
                        : "pending"
                  }
                >
                  <span className="mr-1">0{index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <div className="save-album-modal-main">
          <div ref={scrollRef} className="save-album-modal-scroll">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                {step === 0 && (
                  <section>
                    <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
                      Paso 1
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
                      ¿Qué te hace sentir?
                    </h3>
                    <p className="album-action-modal-muted mt-2 text-sm">
                      Selecciona una o varias emociones para recordar por qué
                      guardas este disco.
                    </p>
                    <div className="mt-5">
                      <MoodSelector
                        variant="carousel"
                        selectedMoods={feelings}
                        onChange={setFeelings}
                      />
                    </div>
                    <p className="album-action-modal-muted mt-3 text-xs">
                      {feelings.length
                        ? `${feelings.length} ${feelings.length === 1 ? "sensación" : "sensaciones"} seleccionada${feelings.length === 1 ? "" : "s"}`
                        : "Puedes continuar sin seleccionar ninguna."}
                    </p>
                  </section>
                )}
                {step === 1 && (
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
                      <OptionCarousel
                        ariaLabel="Actividades"
                        className="activity-carousel"
                      >
                        {activityOptions.map(({ emoji, id: activity }) => {
                          const selected = activities.includes(activity);
                          return (
                            <button
                              key={activity}
                              type="button"
                              data-selected={selected}
                              aria-pressed={selected}
                              onClick={() =>
                                setActivities((current) =>
                                  selected
                                    ? current.filter(
                                        (item) => item !== activity,
                                      )
                                    : [...current, activity],
                                )
                              }
                              className="save-album-modal-option flex items-center gap-3 rounded-xl p-3 text-left transition"
                            >
                              <Medallion
                                emoji={emoji}
                                size="sm"
                                onAccent={selected}
                              />
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
                )}
                {step === 2 && (
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
                      {(
                        [
                          "digital",
                          "vinyl",
                          "cd",
                          "cassette",
                        ] as FavoriteFormat[]
                      ).map((item) => {
                        const selected = format.includes(item);
                        const label =
                          item === "vinyl"
                            ? "Vinilo"
                            : item === "cassette"
                              ? "Cassette"
                              : item === "cd"
                                ? "CD"
                                : "Digital";
                        return (
                          <button
                            key={item}
                            type="button"
                            data-selected={selected}
                            onClick={() =>
                              setFormat((current) =>
                                selected
                                  ? current.filter((value) => value !== item)
                                  : [...current, item],
                              )
                            }
                            className="save-album-modal-option rounded-xl px-3 py-4 text-center text-sm transition"
                          >
                            {label}
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
                      <h4 className="text-sm font-semibold">
                        {tTags("title")}
                      </h4>
                      <p className="album-action-modal-muted mt-1 text-xs">
                        {tTags("description")}
                      </p>
                      <div className="mt-3">
                        <TagEditor tags={tags} onChange={setTags} />
                      </div>
                    </div>
                  </section>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {error && (
            <p
              role="alert"
              className="border-t border-[var(--kanso-danger)]/20 bg-[var(--kanso-danger)]/10 px-5 py-3 text-xs text-[var(--kanso-danger)] sm:px-7"
            >
              {error}
            </p>
          )}

          <footer className="modal-shell-actions modal-shell-actions--roomy">
            <button
              type="button"
              onClick={() =>
                step === 0 ? onClose() : setStep((current) => current - 1)
              }
              className="modal-action-secondary"
            >
              {step === 0 ? t("cancel") : "← Atrás"}
            </button>
            <button
              type="button"
              onClick={() =>
                step < 2 ? setStep((current) => current + 1) : save()
              }
              disabled={loading || (step === 2 && format.length === 0)}
              className="modal-action-primary"
            >
              {loading
                ? "Guardando..."
                : step < 2
                  ? "Continuar →"
                  : isEditing
                    ? t("saveChanges")
                    : "Guardar álbum"}
            </button>
          </footer>
        </div>
      </div>
    </ModalShell>
  );
};
