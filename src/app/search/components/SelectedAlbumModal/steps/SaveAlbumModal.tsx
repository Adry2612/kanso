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
    <section
      className="album-action-modal album-save-modal album-art-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-album-title"
    >
      <header className="album-art-modal-hero">
        <ArtistBackdrop
          artistId={album.artists[0]?.id}
          artistName={album.artists[0]?.name}
        />
        <div className="album-art-modal-hero-content">
          <div className="flex items-start justify-between gap-4">
            <span className="relative z-10 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white/85 backdrop-blur">
              Nueva incorporación
            </span>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-xl text-white/80 hover:bg-black/45 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      </header>
      <div className="album-art-modal-body !pb-0">
        <div className="album-modal-album-row">
          <img
            src={album.images[0]?.url}
            alt={album.name}
            className="album-art-modal-floating-cover"
          />
          <div className="album-modal-album-meta">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#9be7a5]">
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
        <div className="mt-5 grid grid-cols-3 gap-2 border-emerald-100/10 pt-4">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`pb-4 pt-2 text-[10px] font-bold uppercase tracking-[.12em] transition ${index <= step ? "border-t-2 border-[#9be7a5] text-[#9be7a5]" : "border-t-2 border-emerald-100/10 text-[#8f9f93]"}`}
            >
              <span className="mr-1">0{index + 1}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="album-action-modal-soft min-h-[300px] px-5 py-6 sm:px-7">
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
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9be7a5]">
                  Paso 1
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-.04em]">
                  ¿Qué te hace sentir?
                </h3>
                <p className="album-action-modal-muted mt-2 text-sm">
                  Selecciona una o varias emociones para recordar por qué
                  guardas este disco.
                </p>
                <div className="mt-5 rounded-xl border border-emerald-100/10 p-2">
                  <MoodSelector
                    onChange={setFeelings}
                    compact
                    initialSelectedMoods={initialFeelings}
                  />
                </div>
                <p className="album-action-modal-muted mt-3 text-xs">
                  {feelings.length
                    ? `${feelings.length} sensación${feelings.length === 1 ? "" : "es"} seleccionada${feelings.length === 1 ? "" : "s"}`
                    : "Puedes continuar sin seleccionar ninguna."}
                </p>
                <div className="mt-6 border-t border-emerald-100/10 pt-5">
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
                      className="rounded-xl border border-emerald-100/15 px-3 py-2 text-sm text-[#9be7a5] hover:border-[#9be7a5]/60"
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
                          className="rounded-full bg-emerald-100/10 px-3 py-1.5 text-xs text-[#d6e5d8] hover:text-[#ffb292]"
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
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9be7a5]">
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
                <p className="text-xs font-bold uppercase tracking-[.18em] text-[#9be7a5]">
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
        {error && (
          <p className="mt-5 rounded-xl border border-[#ff9f76]/30 bg-[#ff9f76]/10 p-3 text-xs text-[#ffb292]">
            {error}
          </p>
        )}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-emerald-100/10 px-5 py-4 sm:px-7">
        <button
          type="button"
          onClick={() =>
            step === 0 ? onClose() : setStep((current) => current - 1)
          }
          className="rounded-xl px-3 py-2.5 text-sm text-[#8f9f93] transition hover:text-white"
        >
          {step === 0 ? t("cancel") : "← Atrás"}
        </button>
        <button
          type="button"
          onClick={() =>
            step < 2 ? setStep((current) => current + 1) : save()
          }
          disabled={loading || (step === 2 && format.length === 0)}
          className="rounded-xl bg-[#9be7a5] px-5 py-2.5 text-sm font-semibold text-[#102117] transition hover:bg-[#d6f28d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Guardando..."
            : step < 2
              ? "Continuar →"
              : "Guardar álbum"}
        </button>
      </footer>
    </section>
  );
};
