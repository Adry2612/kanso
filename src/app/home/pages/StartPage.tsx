import React, { useEffect, useState } from "react";
import { getRecomendationHistory } from "@/lib/api/recomendation";
import { useAuth } from "@/context/AuthContext";
import AlbumCard from "@/components/AlbumCard";
import { Skeleton } from "@/components/Skeleton";
import { useTransitionRouter } from "next-view-transitions";
import { musicalFeelings } from "@/constants/feelings";
import { activityOptions } from "@/constants/activities";
import { useTranslations } from "@/context/I18nContext";
import { moodLabelToKey } from "@/lib/activityRecommendations";
import type { FavoriteFormat } from "@/types/favorites";
import { Stagger, StaggerItem } from "@/components/motion";

export default function StartPage() {
  const router = useTransitionRouter();
  const { user } = useAuth();
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [recomendationHistory, setRecomendationHistory] = useState<any[]>([]);
  const [selectedMood, setSelectedMood] = useState<string[]>([]);
  const [recommendationType, setRecommendationType] = useState<
    "mood" | "activity"
  >("mood");
  const [selectedActivity, setSelectedActivity] = useState<string[]>([]);
  const [selectorPage, setSelectorPage] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<"all" | FavoriteFormat>(
    "all",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [collectionTags, setCollectionTags] = useState<
    { category: string; value: string }[]
  >([]);
  const [recommendationStep, setRecommendationStep] = useState<0 | 1>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const fetchRecomendationHistory = async () => {
      setLoading(true);
      setHistoryError(null);
      try {
        const { history } = await getRecomendationHistory(user.uid);
        setRecomendationHistory(history || []);
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistoryError(
          "No pudimos cargar tus recomendaciones. Inténtalo de nuevo más tarde.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecomendationHistory();
  }, [user?.uid, mounted]);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/userFavorites?userId=${encodeURIComponent(user.uid)}`)
      .then((response) => (response.ok ? response.json() : { favorites: [] }))
      .then((data) => {
        const unique = new Map<string, { category: string; value: string }>();
        (data.favorites || [])
          .flatMap((favorite: any) => favorite.tags || [])
          .forEach((tag: { category: string; value: string }) =>
            unique.set(`${tag.category}:${tag.value}`, tag),
          );
        setCollectionTags(Array.from(unique.values()));
      })
      .catch(() => setCollectionTags([]));
  }, [user?.uid]);

  const moods = musicalFeelings.map((feeling) => [
    feeling.symbol,
    moodLabelToKey[feeling.nombre]
      ? tMoods(moodLabelToKey[feeling.nombre])
      : feeling.nombre,
    feeling.key,
  ]);

  const handleRecommendation = () => {
    const params = new URLSearchParams({ format: selectedFormat });
    selectedMood.forEach((mood) => params.append("moods", mood));
    selectedActivity.forEach((activity) => params.append("activity", activity));
    selectedTags.forEach((tag) => params.append("tag", tag));
    params.set("type", selectedActivity.length ? "activity" : "mood");
    router.push(`/recommendation?${params.toString()}`);
  };

  const hasSelection = selectedMood.length > 0 || selectedActivity.length > 0;
  const selectorItems =
    recommendationType === "mood"
      ? moods
      : activityOptions.map(({ icon, id }) => [icon, tActivities(id), id]);
  const selectorPageSize = 8;
  const selectorPageCount = Math.ceil(selectorItems.length / selectorPageSize);
  const visibleSelectorItems = selectorItems.slice(
    selectorPage * selectorPageSize,
    (selectorPage + 1) * selectorPageSize,
  );
  const recentRecommendations = recomendationHistory
    .filter((item) => item.album?.id)
    .slice(0, 3);

  return (
    <main className="collectify-main">
      <section className="mt-14 max-w-3xl md:mt-24">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9be7a5]">
          Martes, 7 de septiembre
        </p>
        <h1 className="collectify-page-title">
          ¿Qué quieres <em>escuchar</em> hoy?
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#8f9f93] md:text-base">
          Cuéntame cómo estás y encontraré un disco que encaje con este momento.
        </p>
      </section>
      <div className="mt-12 grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,.72fr)]">
        <section className="collectify-panel relative pl-15 overflow-hidden p-6 md:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {recommendationStep === 1
                  ? "Elige tu fuente"
                  : recommendationType === "mood"
                    ? "Elige una sensación"
                    : "Elige una actividad"}
              </h2>
              <p className="mt-2 text-xs mb-5 text-[#8f9f93]">
                No hay respuestas incorrectas.
              </p>
            </div>
          </div>
          {recommendationStep === 0 && (
            <div className="mb-6 flex max-w-sm rounded-xl border border-emerald-100/10 bg-[#09140d]/25 p-1">
              {[
                ["Por emoción", "mood"],
                ["Por actividad", "activity"],
              ].map(([label, type]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => (
                    setRecommendationType(type as "mood" | "activity"),
                    setRecommendationStep(0)
                  )}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${recommendationType === type ? "bg-[#9be7a5] text-[#102117]" : "text-[#8f9f93] hover:text-white"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {recommendationStep === 0 && (
            <div className="relative z-10 mt-8 flex items-center gap-3">
              <button
                type="button"
                aria-label="Página anterior"
                onClick={() => setSelectorPage((page) => Math.max(0, page - 1))}
                disabled={selectorPage === 0}
                className="rounded-full border border-emerald-100/15 p-1 text-[#9be7a5] disabled:opacity-30"
              >
                ←
              </button>
              <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
                {visibleSelectorItems.map(([symbol, label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      recommendationType === "mood"
                        ? setSelectedMood((current) =>
                            current.includes(value)
                              ? current.filter((item) => item !== value)
                              : [...current, value],
                          )
                        : setSelectedActivity((current) =>
                            current.includes(value)
                              ? current.filter((item) => item !== value)
                              : [...current, value],
                          )
                    }
                    className={`flex min-h-[76px] flex-col justify-between rounded-xl border p-3 text-left transition ${(recommendationType === "mood" && selectedMood.includes(value)) || (recommendationType === "activity" && selectedActivity.includes(value)) ? "border-[#9be7a5] bg-[#9be7a5] text-[#102117]" : "border-emerald-100/10 bg-[#09140d]/25 text-[#b4c2b6] hover:-translate-y-0.5 hover:border-[#9be7a5]/60"}`}
                  >
                    <span className="text-xl">{symbol}</span>
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Página siguiente"
                onClick={() =>
                  setSelectorPage((page) =>
                    Math.min(selectorPageCount - 1, page + 1),
                  )
                }
                disabled={selectorPage >= selectorPageCount - 1}
                className="rounded-full border border-emerald-100/15 p-1 text-[#9be7a5] disabled:opacity-30"
              >
                →
              </button>
            </div>
          )}
          {recommendationStep === 0 ? (
            <div className="relative z-10 mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <p className="text-xs text-[#8f9f93]">
                Has elegido:{" "}
                <strong className="text-white">
                  {recommendationType === "mood"
                    ? selectedMood.map((mood) => tMoods(mood)).join(", ") ||
                      "ninguna emoción"
                    : selectedActivity
                        .map((activity) => tActivities(activity))
                        .join(", ") || "ninguna actividad"}
                </strong>
              </p>
              <button
                onClick={() => setRecommendationStep(1)}
                disabled={!hasSelection}
                className="rounded-xl bg-[#9be7a5] px-4 py-3 text-sm font-bold text-[#102117] transition hover:bg-[#d6f28d] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <div className="relative z-10 mt-8">
              <p className="text-sm font-semibold text-white">
                ¿De dónde quieres que salga?
              </p>
              <p className="mt-2 text-xs text-[#8f9f93]">
                Elige si quieres explorar toda tu colección o un formato físico
                concreto.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Toda mi colección", "all"],
                  ["Vinilos", "vinyl"],
                  ["CDs", "cd"],
                  ["Cassettes", "cassette"],
                ].map(([label, value]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSelectedFormat(value as "all" | FavoriteFormat)
                    }
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${selectedFormat === value ? "border-[#9be7a5] bg-[#9be7a5] text-[#102117]" : "border-emerald-100/10 text-[#8f9f93] hover:border-[#9be7a5]/60 hover:text-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {collectionTags.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-white">
                    Recomendar también por etiquetas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collectionTags.map((tag) => {
                      const value = `${tag.category}:${tag.value}`;
                      const selected = selectedTags.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setSelectedTags((current) =>
                              selected
                                ? current.filter((item) => item !== value)
                                : [...current, value],
                            )
                          }
                          className={`rounded-full border px-3 py-2 text-xs transition ${selected ? "border-[#9be7a5] bg-[#9be7a5] text-[#102117]" : "border-emerald-100/15 text-[#b4c2b6] hover:border-[#9be7a5]/60"}`}
                        >
                          {tag.category}: {tag.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setRecommendationStep(0)}
                  className="rounded-xl px-3 py-2.5 text-sm text-[#8f9f93] hover:text-white"
                >
                  ← Atrás
                </button>
                <button
                  type="button"
                  onClick={handleRecommendation}
                  className="rounded-xl bg-[#9be7a5] px-4 py-3 text-sm font-bold text-[#102117] transition hover:bg-[#d6f28d]"
                >
                  Encontrar mi disco <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          )}
        </section>
        <aside className="grid gap-7">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="collectify-section-title">
                Últimas recomendaciones
              </h2>
              <button
                onClick={() => router.push("/recomendationHistory")}
                className="text-xs font-semibold text-[#9be7a5]"
              >
                Ver historial →
              </button>
            </div>
            {loading ? (
              <div className="grid gap-2">
                {[...Array(3)].map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-16 rounded-xl bg-[#17261c]"
                  />
                ))}
              </div>
            ) : historyError ? (
              <p
                role="alert"
                className="text-sm leading-relaxed text-[#ff9f76]"
              >
                {historyError}
              </p>
            ) : recentRecommendations.length > 0 ? (
              <Stagger className="grid gap-2" stagger={0.05}>
                {recentRecommendations.map((item) => (
                  <StaggerItem key={item.id}>
                    <button
                      onClick={() => router.push(`/albums/${item.album.id}`)}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:border-emerald-100/10 hover:bg-[#1d3023]"
                    >
                      <img
                        src={item.album.images[0]?.url}
                        alt={item.album.name}
                        style={{
                          viewTransitionName: `album-cover-${item.album.id}`,
                        }}
                        className="h-14 w-14 rounded-[var(--radius-xs)] object-cover"
                      />
                      <span className="min-w-0">
                        <strong className="block truncate text-sm text-white">
                          {item.album.name}
                        </strong>
                        <small className="mt-1 block truncate text-xs text-[#8f9f93]">
                          {item.album.artists[0]?.name}
                        </small>
                      </span>
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="rounded-xl border border-emerald-100/10 bg-[#17261c]/45 p-4">
                <p className="text-sm leading-relaxed text-[#8f9f93]">
                  Todavía no tienes recomendaciones. Busca álbumes para empezar
                  tu colección o elige un momento para recibir una.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/search")}
                  className="mt-3 text-sm font-semibold text-[#9be7a5] underline"
                >
                  Explorar discos
                </button>
              </div>
            )}
          </section>
          <p className="border-t border-emerald-100/10 pt-5 text-sm leading-relaxed text-[#8f9f93]">
            “La música es para el alma lo que las palabras son para la mente.”
            <strong className="mt-2 block text-xs text-white">
              — Modest Mouse
            </strong>
          </p>
        </aside>
      </div>
    </main>
  );
}
