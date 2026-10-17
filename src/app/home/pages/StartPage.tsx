/* eslint-disable @next/next/no-img-element -- portadas del CDN de Spotify; la optimización de imágenes se decide en improve-performance */
import React, { useEffect, useState } from "react";
import { getRecomendationHistory } from "@/lib/api/recomendation";
import { authFetch } from "@/lib/api/authFetch";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/Skeleton";
import { useTransitionRouter } from "next-view-transitions";
import { useTranslations } from "@/context/I18nContext";
import MoodSelector from "@/components/MoodSelector";
import type { FavoriteFormat } from "@/types/favorites";
import { Stagger, StaggerItem } from "@/components/motion";

type HistoryEntry = {
  id: string;
  album: {
    id: string;
    name: string;
    images: { url: string }[];
    artists: { name: string }[];
  };
};

type FavoriteWithTags = {
  tags?: { category: string; value: string }[];
};

export default function StartPage() {
  const router = useTransitionRouter();
  const { user } = useAuth();
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tQuick = useTranslations("quickRecommendation");

  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [recomendationHistory, setRecomendationHistory] = useState<
    HistoryEntry[]
  >([]);
  const [selectedMood, setSelectedMood] = useState<string[]>([]);
  const [recommendationType, setRecommendationType] = useState<
    "mood" | "activity"
  >("mood");
  const [selectedActivity, setSelectedActivity] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<"all" | FavoriteFormat>(
    "all",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [collectionTags, setCollectionTags] = useState<
    { category: string; value: string }[]
  >([]);
  const [recommendationStep, setRecommendationStep] = useState<0 | 1>(0);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickFormat, setQuickFormat] = useState<"all" | FavoriteFormat>("all");
  const [quickTag, setQuickTag] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fecha real del día, calculada tras montar para no desajustar la hidratación.
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(
      document.documentElement.lang || "es",
      { weekday: "long", day: "numeric", month: "long" },
    );
    const label = formatter.format(new Date());
    setToday(label.charAt(0).toUpperCase() + label.slice(1));
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
        const { history } = await getRecomendationHistory();
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
    authFetch("/api/userFavorites")
      .then((response) => (response.ok ? response.json() : { favorites: [] }))
      .then((data) => {
        const unique = new Map<string, { category: string; value: string }>();
        (data.favorites || [])
          .flatMap((favorite: FavoriteWithTags) => favorite.tags || [])
          .forEach((tag: { category: string; value: string }) =>
            unique.set(`${tag.category}:${tag.value}`, tag),
          );
        setCollectionTags(Array.from(unique.values()));
      })
      .catch(() => setCollectionTags([]));
  }, [user?.uid]);

  const handleRecommendation = () => {
    const params = new URLSearchParams({ format: selectedFormat });
    selectedMood.forEach((mood) => params.append("moods", mood));
    selectedActivity.forEach((activity) => params.append("activity", activity));
    selectedTags.forEach((tag) => params.append("tag", tag));
    params.set("type", selectedActivity.length ? "activity" : "mood");
    router.push(`/recommendation?${params.toString()}`);
  };

  const handleQuickRecommendation = () => {
    const params = new URLSearchParams({ format: quickFormat });
    if (quickTag) params.append("tag", quickTag);
    params.set("type", "mood");
    router.push(`/recommendation?${params.toString()}`);
  };

  const hasSelection = selectedMood.length > 0 || selectedActivity.length > 0;
  const recentRecommendations = recomendationHistory
    .filter((item) => item.album?.id)
    .slice(0, 3);

  const selectedLabels =
    recommendationType === "mood"
      ? selectedMood.map((mood) => tMoods(mood)).join(", ")
      : selectedActivity.map((activity) => tActivities(activity)).join(", ");

  return (
    <main className="collectify-main">
      <section className="mt-14 max-w-3xl md:mt-24">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--collectify-mint)]">
          {today || "\u00a0"}
        </p>
        <h1 className="collectify-page-title">
          ¿Qué quieres <em>escuchar</em> hoy?
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--collectify-muted)] md:text-base">
          Cuéntame cómo estás y encontraré un disco que encaje con este momento.
        </p>
      </section>

      <div className="mt-12 grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,.72fr)]">
        <div className="grid content-start gap-7">
          <section className="collectify-panel p-6 md:p-9">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {recommendationStep === 1
                ? "Elige tu fuente"
                : recommendationType === "mood"
                  ? "Elige una sensación"
                  : "Elige una actividad"}
            </h2>
            <p className="mt-2 text-xs text-[var(--collectify-muted)]">
              {recommendationStep === 1
                ? "Elige si quieres explorar toda tu colección o un formato físico concreto."
                : "No hay respuestas incorrectas."}
            </p>

            {recommendationStep === 0 && (
              <>
                <div
                  role="tablist"
                  aria-label="Tipo de recomendación"
                  className="mb-6 mt-5 flex max-w-sm rounded-[var(--radius-sm)] border border-[var(--collectify-line)] bg-[var(--surface-2)] p-1"
                >
                  {[
                    ["Por emoción", "mood"],
                    ["Por actividad", "activity"],
                  ].map(([label, type]) => {
                    const isActive = recommendationType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setRecommendationType(type as "mood" | "activity");
                          setRecommendationStep(0);
                        }}
                        className={`flex-1 rounded-[var(--radius-xs)] px-3 py-2 text-xs font-semibold transition ${
                          isActive
                            ? "bg-[var(--collectify-mint)] text-[var(--background)]"
                            : "text-[var(--collectify-muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <MoodSelector
                  mode={recommendationType}
                  selected={
                    recommendationType === "mood"
                      ? selectedMood
                      : selectedActivity
                  }
                  onChange={
                    recommendationType === "mood"
                      ? setSelectedMood
                      : setSelectedActivity
                  }
                  label={
                    recommendationType === "mood" ? "Emociones" : "Actividades"
                  }
                />

                <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <p className="text-xs text-[var(--collectify-muted)]">
                    Has elegido:{" "}
                    <strong className="text-[var(--foreground)]">
                      {selectedLabels || "nada todavía"}
                    </strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setRecommendationStep(1)}
                    disabled={!hasSelection}
                    className="rounded-[var(--radius-sm)] bg-[var(--collectify-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Siguiente <span aria-hidden="true">→</span>
                  </button>
                </div>
              </>
            )}

            {recommendationStep === 1 && (
              <div className="mt-6">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    ["Toda mi colección", "all"],
                    ["Vinilos", "vinyl"],
                    ["CDs", "cd"],
                    ["Cassettes", "cassette"],
                  ].map(([label, value]) => {
                    const isSelected = selectedFormat === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setSelectedFormat(value as "all" | FavoriteFormat)
                        }
                        className={`rounded-[var(--radius-sm)] border px-3 py-2.5 text-xs font-semibold transition ${
                          isSelected
                            ? "border-[var(--collectify-mint)] bg-[var(--collectify-mint)] text-[var(--background)]"
                            : "border-[var(--collectify-line)] text-[var(--collectify-muted)] hover:border-[var(--collectify-mint)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {collectionTags.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Recomendar también por etiquetas
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {collectionTags.map((tag) => {
                        const value = `${tag.category}:${tag.value}`;
                        const isSelected = selectedTags.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              setSelectedTags((current) =>
                                isSelected
                                  ? current.filter((item) => item !== value)
                                  : [...current, value],
                              )
                            }
                            className={`rounded-[var(--radius-pill)] border px-3 py-2 text-xs transition ${
                              isSelected
                                ? "border-[var(--collectify-mint)] bg-[var(--collectify-mint)] text-[var(--background)]"
                                : "border-[var(--collectify-line)] text-[var(--collectify-muted)] hover:border-[var(--collectify-mint)]"
                            }`}
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
                    className="rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-[var(--collectify-muted)] hover:text-[var(--foreground)]"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="button"
                    onClick={handleRecommendation}
                    className="rounded-[var(--radius-sm)] bg-[var(--collectify-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:opacity-90"
                  >
                    Encontrar mi disco <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Vía secundaria: la recomendación rápida queda subordinada al panel principal. */}
          <section className="border-t border-[var(--collectify-line)] pt-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                ¿Sin ganas de elegir?
              </span>
              <button
                type="button"
                onClick={() => setQuickOpen((open) => !open)}
                aria-expanded={quickOpen}
                className="w-fit text-sm font-semibold text-[var(--collectify-mint)] hover:underline"
              >
                ⚡ {tQuick("open")}
              </button>
            </div>

            {quickOpen && (
              <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--collectify-line)] bg-[var(--surface-2)] p-5">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {tQuick("title")}
                </p>
                <p className="mt-1 text-xs text-[var(--collectify-muted)]">
                  {tQuick("subtitle")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    [tQuick("anyFormat"), "all"],
                    [tQuick("vinyl"), "vinyl"],
                    [tQuick("cd"), "cd"],
                    [tQuick("cassette"), "cassette"],
                  ].map(([label, value]) => {
                    const isSelected = quickFormat === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          setQuickFormat(value as "all" | FavoriteFormat)
                        }
                        className={`rounded-[var(--radius-sm)] border px-3 py-2.5 text-xs font-semibold transition ${
                          isSelected
                            ? "border-[var(--collectify-mint)] bg-[var(--collectify-mint)] text-[var(--background)]"
                            : "border-[var(--collectify-line)] text-[var(--collectify-muted)] hover:border-[var(--collectify-mint)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                {collectionTags.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold text-[var(--collectify-muted)]">
                      {tQuick("tagsLabel")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {collectionTags.map((tag) => {
                        const value = `${tag.category}:${tag.value}`;
                        const isSelected = quickTag === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() =>
                              setQuickTag(isSelected ? null : value)
                            }
                            className={`rounded-[var(--radius-pill)] border px-3 py-2 text-xs transition ${
                              isSelected
                                ? "border-[var(--collectify-mint)] bg-[var(--collectify-mint)] text-[var(--background)]"
                                : "border-[var(--collectify-line)] text-[var(--collectify-muted)] hover:border-[var(--collectify-mint)]"
                            }`}
                          >
                            {tag.category}: {tag.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleQuickRecommendation}
                    className="rounded-[var(--radius-sm)] bg-[var(--collectify-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:opacity-90"
                  >
                    {tQuick("cta")} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="grid content-start gap-7">
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="collectify-section-title">
                Últimas recomendaciones
              </h2>
              <button
                type="button"
                onClick={() => router.push("/recomendationHistory")}
                className="text-xs font-semibold text-[var(--collectify-mint)]"
              >
                Ver historial →
              </button>
            </div>
            {loading ? (
              <div className="grid gap-2">
                {[...Array(3)].map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-16 rounded-[var(--radius-sm)] bg-[var(--surface-2)]"
                  />
                ))}
              </div>
            ) : historyError ? (
              <p
                role="alert"
                className="text-sm leading-relaxed text-[var(--collectify-danger)]"
              >
                {historyError}
              </p>
            ) : recentRecommendations.length > 0 ? (
              <Stagger className="grid gap-2" stagger={0.05} onMount>
                {recentRecommendations.map((item) => (
                  <StaggerItem key={item.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/albums/${item.album.id}`)}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-sm)] border border-transparent p-2 text-left transition hover:border-[var(--collectify-line)] hover:bg-[var(--surface-2)]"
                    >
                      <img
                        loading="lazy"
                        decoding="async"
                        src={item.album.images[0]?.url}
                        alt={item.album.name}
                        style={{
                          viewTransitionName: `album-cover-${item.album.id}`,
                        }}
                        className="h-14 w-14 rounded-[var(--radius-xs)] object-cover"
                      />
                      <span className="min-w-0">
                        <strong className="block truncate text-sm text-[var(--foreground)]">
                          {item.album.name}
                        </strong>
                        <small className="mt-1 block truncate text-xs text-[var(--collectify-muted)]">
                          {item.album.artists[0]?.name}
                        </small>
                      </span>
                    </button>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <div className="rounded-[var(--radius-sm)] border border-[var(--collectify-line)] bg-[var(--surface-2)] p-4">
                <p className="text-sm leading-relaxed text-[var(--collectify-muted)]">
                  Todavía no tienes recomendaciones. Busca álbumes para empezar
                  tu colección o elige un momento para recibir una.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/search")}
                  className="mt-3 text-sm font-semibold text-[var(--collectify-mint)] underline"
                >
                  Explorar discos
                </button>
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
