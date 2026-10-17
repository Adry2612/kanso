/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import MoodSelector from "@/components/MoodSelector";
import { useAuth } from "@/context/AuthContext";
import { Album } from "../../../../../../models/album";
import { useFetch } from "@/hooks/useFetch";
import { addFavorite } from "@/lib/api/favorites";
import { useTranslations } from "@/context/I18nContext";
import { FavoriteFormat, FavoriteTag } from "@/types/favorites";
import ArtistBackdrop from "./ArtistBackdrop";
import ModalShell from "@/components/ModalShell";
import { activityOptions } from "@/constants/activities";
import { AnimatePresence, EASE_OUT, motion } from "@/components/motion";

type SaveAlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  album: Album;
  onSave: (favoriteData?: any) => void;
  feelings: string[];
  setFeelings: React.Dispatch<React.SetStateAction<string[]>>;
  initialFeelings?: string[];
  initialActivities?: string[];
  initialFormat?: FavoriteFormat[];
  initialTags?: FavoriteTag[];
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
}: SaveAlbumModalProps) => {
  const t = useTranslations("modal");
  const tActivities = useTranslations("activities");
  const { user } = useAuth();
  const { execute: saveFavorite, loading, error } = useFetch(addFavorite);
  const [step, setStep] = useState(0);
  const [activities, setActivities] = useState<string[]>([]);
  const [format, setFormat] = useState<FavoriteFormat[]>(["digital"]);
  const [tags, setTags] = useState<FavoriteTag[]>([]);
  const [tagCategory, setTagCategory] = useState("idioma");
  const [tagValue, setTagValue] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setStep(0);
    setFeelings(initialFeelings);
    setActivities(initialActivities);
    setFormat(initialFormat);
    setTags(initialTags);
    setTagCategory("idioma");
    setTagValue("");
    // Resetear con los valores initial* borraría las ediciones en curso del modal;
    // solo debe re-inicializarse al abrirse o al cambiar de álbum.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, album.id]);

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
      size="lg"
      labelledBy="save-album-title"
      closeLabel={t("close")}
      hero={
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
      }
      heroBadge="Nueva incorporación"
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
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--collectify-mint)]">
              Álbum
            </p>
            <h2
              id="save-album-title"
              className="mt-1 truncate text-2xl font-semibold tracking-[-.05em]"
            >
              {album.name}
            </h2>
            <p className="album-action-modal-muted mt-1 truncate text-sm">
              {album.artists.map((artist: any) => artist.name).join(", ")}
            </p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 border-[var(--collectify-line)] pt-4">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`pb-4 pt-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${index <= step ? "border-t-2 border-[var(--collectify-mint)] text-[var(--collectify-mint)]" : "border-t-2 border-[var(--collectify-line)] text-[var(--collectify-muted)]"}`}
            >
              <span className="mr-1">0{index + 1}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="album-action-modal-soft min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
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
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--collectify-mint)]">
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
                    mode="mood"
                    selected={feelings}
                    onChange={setFeelings}
                    label="Sensaciones"
                  />
                </div>
                <p className="album-action-modal-muted mt-3 text-xs">
                  {feelings.length
                    ? `${feelings.length} sensación${feelings.length === 1 ? "" : "es"} seleccionada${feelings.length === 1 ? "" : "s"}`
                    : "Puedes continuar sin seleccionar ninguna."}
                </p>
                <div className="mt-6 border-t border-[var(--collectify-line)] pt-5">
                  <h4 className="text-sm font-semibold">
                    Etiquetas personales
                  </h4>
                  <p className="album-action-modal-muted mt-1 text-xs">
                    Añade una categoría y su valor, por ejemplo idioma: inglés o
                    género: pop.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[150px_1fr_auto]">
                    <select
                      value={tagCategory}
                      onChange={(event) => setTagCategory(event.target.value)}
                      className="collectify-input px-3 py-2 text-sm"
                    >
                      <option value="idioma">Idioma</option>
                      <option value="género">Género</option>
                      <option value="personal">Personal</option>
                    </select>
                    <input
                      value={tagValue}
                      onChange={(event) => setTagValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          const value = tagValue.trim();
                          if (
                            value &&
                            !tags.some(
                              (tag) =>
                                tag.category === tagCategory &&
                                tag.value === value.toLowerCase(),
                            )
                          ) {
                            setTags([
                              ...tags,
                              { category: tagCategory, value },
                            ]);
                            setTagValue("");
                          }
                        }
                      }}
                      placeholder="Escribe un subtag"
                      className="collectify-input px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const value = tagValue.trim();
                        if (
                          value &&
                          !tags.some(
                            (tag) =>
                              tag.category === tagCategory &&
                              tag.value === value.toLowerCase(),
                          )
                        ) {
                          setTags([...tags, { category: tagCategory, value }]);
                          setTagValue("");
                        }
                      }}
                      className="rounded-xl border border-[var(--collectify-line-strong)] px-3 py-2 text-sm text-[var(--collectify-mint)] hover:border-[var(--collectify-mint)]/60"
                    >
                      Añadir
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={`${tag.category}-${tag.value}`}
                          type="button"
                          onClick={() =>
                            setTags(
                              tags.filter(
                                (item) =>
                                  item.category !== tag.category ||
                                  item.value !== tag.value,
                              ),
                            )
                          }
                          className="rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:text-[var(--collectify-danger)]"
                        >
                          {tag.category}: {tag.value} ×
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
            {step === 1 && (
              <section>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--collectify-mint)]">
                  Paso 2
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
                  ¿Cuándo lo escuchas?
                </h3>
                <p className="album-action-modal-muted mt-2 text-sm">
                  Añade actividades para encontrarlo más fácilmente después.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {activityOptions.map(({ icon, id: activity }) => {
                    const selected = activities.includes(activity);
                    return (
                      <button
                        key={activity}
                        type="button"
                        data-selected={selected}
                        onClick={() =>
                          setActivities((current) =>
                            selected
                              ? current.filter((item) => item !== activity)
                              : [...current, activity],
                          )
                        }
                        className="save-album-modal-option rounded-xl p-3 text-left transition"
                      >
                        <span className="block text-lg">{icon}</span>
                        <span className="mt-2 block text-xs font-semibold">
                          {tActivities(activity)}
                        </span>
                      </button>
                    );
                  })}
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
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--collectify-mint)]">
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
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p
          role="alert"
          className="border-t border-[var(--collectify-danger)]/20 bg-[var(--collectify-danger)]/10 px-5 py-3 text-xs text-[var(--collectify-danger)] sm:px-7"
        >
          {error}
        </p>
      )}

      <footer className="modal-shell-actions">
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
              : "Guardar álbum"}
        </button>
      </footer>
    </ModalShell>
  );
};
