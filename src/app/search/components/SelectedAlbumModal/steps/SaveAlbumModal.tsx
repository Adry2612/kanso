/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Library } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
import { useAuth } from "@/context/AuthContext";
import { Album } from "../../../../../../models/album";
import { useFetch } from "@/hooks/useFetch";
import { addFavorite } from "@/lib/api/favorites";
import { addToListenLater } from "@/lib/api/listenLater";
import { useTranslations } from "@/context/I18nContext";
import {
  FavoriteFormat,
  FavoriteTag,
  SaveAlbumResult,
} from "@/types/favorites";
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
  onSave: (result: SaveAlbumResult) => void;
  feelings: Array<any>;
  setFeelings: React.Dispatch<React.SetStateAction<Array<any>>>;
  initialFeelings?: Array<any>;
  initialActivities?: string[];
  initialFormat?: FavoriteFormat[];
  initialTags?: FavoriteTag[];
  isEditing?: boolean;
  /** Salta la elección de destino al pasar un pendiente a la colección. */
  forceCollection?: boolean;
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
  forceCollection = false,
}: SaveAlbumModalProps) => {
  const t = useTranslations("modal");
  const tTags = useTranslations("tags");
  const tActivities = useTranslations("activities");
  const { user } = useAuth();
  const { execute: saveFavorite, loading, error } = useFetch(addFavorite);
  const {
    execute: saveListenLater,
    loading: savingListenLater,
    error: listenLaterError,
  } = useFetch(addToListenLater);
  const [showDestination, setShowDestination] = useState(
    !isEditing && !forceCollection,
  );
  const [step, setStep] = useState(0);
  const [activities, setActivities] = useState<string[]>([]);
  const [format, setFormat] = useState<FavoriteFormat[]>(["digital"]);
  const [tags, setTags] = useState<FavoriteTag[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setShowDestination(!isEditing && !forceCollection);
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
        destination: "collection",
        albumId: album.id,
        feelings: result.feelings,
        activities,
        format,
        tags,
      });
  };

  const saveToListenLater = async () => {
    if (!user?.uid) return;

    const result = await saveListenLater(album);
    if (result !== null) {
      onSave({
        destination: "pending",
        albumId: album.id,
        feelings: [],
        activities: [],
        format: [],
        tags: [],
        addedAt: result.album.addedAt,
        listenLater: result.album,
      });
    }
  };

  const isSaving = loading || savingListenLater;
  const requestError = error || listenLaterError;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="save-album-modal"
      labelledBy="save-album-title"
      closeLabel={t("close")}
      hero={
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
      }
      heroBadge={isEditing ? t("editingBadge") : t("newAlbum")}
    >
      <div className="album-art-modal-body !pb-0">
        <div className="album-modal-album-row">
          <img
            loading="lazy"
            decoding="async"
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
              Álbum
            </p>
            <h2
              id="save-album-title"
              className="mt-1 line-clamp-2 text-2xl font-semibold tracking-[-.05em]"
            >
              {album.name}
            </h2>
            <p className="album-action-modal-muted mt-1 line-clamp-2 text-sm">
              {album.artists.map((artist: any) => artist.name).join(", ")}
            </p>
          </div>
        </div>

        {!showDestination && (
          <ol
            className="mt-5 grid grid-cols-3 gap-2 border-[var(--kanso-line)] pt-4"
            aria-label="Pasos"
          >
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index === step ? "step" : undefined}
                className={`pb-4 pt-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${
                  index <= step
                    ? "border-t-2 border-[var(--kanso-mint)] text-[var(--kanso-mint)]"
                    : "border-t-2 border-[var(--kanso-line)] text-[var(--kanso-muted)]"
                }`}
              >
                <span className="mr-1">0{index + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        )}
      </div>

      <div
        ref={scrollRef}
        className="album-action-modal-soft min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7"
      >
        {showDestination ? (
          <section>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
              {t("destinationEyebrow")}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
              {t("destinationTitle")}
            </h3>
            <p className="album-action-modal-muted mt-2 text-sm">
              {t("destinationDescription")}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDestination(false);
                  setStep(0);
                }}
                className="save-album-modal-option flex h-full flex-col items-start gap-3 rounded-xl p-4 text-left transition"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanso-line)] text-[var(--kanso-mint)]">
                  <Library className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--foreground)]">
                    {t("destinationCollection")}
                  </span>
                  <span className="album-action-modal-muted mt-1 hidden text-xs leading-5 sm:block">
                    {t("destinationCollectionDescription")}
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={saveToListenLater}
                disabled={isSaving}
                className="save-album-modal-option flex h-full flex-col items-start gap-3 rounded-xl p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--kanso-line)] text-[var(--kanso-mint)]">
                  <Clock className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--foreground)]">
                    {savingListenLater ? t("saving") : t("destinationPending")}
                  </span>
                  <span className="album-action-modal-muted mt-1 hidden text-xs leading-5 sm:block">
                    {t("destinationPendingDescription")}
                  </span>
                </span>
              </button>
            </div>
          </section>
        ) : (
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
                                  ? current.filter((item) => item !== activity)
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
                      ["digital", "vinyl", "cd", "cassette"] as FavoriteFormat[]
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
                    <h4 className="text-sm font-semibold">{tTags("title")}</h4>
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
        )}
      </div>

      {requestError && (
        <p
          role="alert"
          className="border-t border-[var(--kanso-danger)]/20 bg-[var(--kanso-danger)]/10 px-5 py-3 text-xs text-[var(--kanso-danger)] sm:px-7"
        >
          {requestError}
        </p>
      )}

      {showDestination ? (
        <footer className="modal-shell-actions modal-shell-actions--roomy">
          <button
            type="button"
            onClick={onClose}
            className="modal-action-secondary"
          >
            {t("cancel")}
          </button>
        </footer>
      ) : (
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
            disabled={isSaving || (step === 2 && format.length === 0)}
            className="modal-action-primary"
          >
            {isSaving
              ? "Guardando..."
              : step < 2
                ? "Continuar →"
                : isEditing
                  ? t("saveChanges")
                  : "Guardar álbum"}
          </button>
        </footer>
      )}
    </ModalShell>
  );
};
