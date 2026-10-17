/* eslint-disable @next/next/no-img-element */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "@/context/AuthContext";
import { getRecomendationHistory } from "@/lib/api/recomendation";
import { openSpotify } from "@/lib/spotifyUtils";
import { formatTime, groupByDate } from "@/utils/dateHelpers";
import React, { useEffect, useMemo, useState } from "react";
import { CiClock2 } from "react-icons/ci";
import { TbMoodHappy } from "react-icons/tb";
import { useTranslations } from "@/context/I18nContext";
import { Skeleton } from "@/components/Skeleton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";

// TODO: Editar estilos
export default function RecomendationHistoryPage() {
  const t = useTranslations("history");
  const tCommon = useTranslations("common");
  const tModal = useTranslations("modal");
  const { user } = useAuth();
  const [recomendationHistory, setRecomendationHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user?.uid) return;

    const fetchRecomendationHistory = async () => {
      setLoading(true);
      try {
        const { history } = await getRecomendationHistory(user.uid);
        setRecomendationHistory(history || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecomendationHistory();
  }, [user?.uid, mounted]);

  const recomendationsGroupedByDate = useMemo(() => {
    return groupByDate(recomendationHistory);
  }, [recomendationHistory]);

  if (!mounted || loading) {
    return (
      <main className="collectify-main min-h-screen">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="mb-10 h-14 w-72" />
        <div className="border-t border-emerald-100/10">
          {[...Array(3)].map((_, idx) => (
            <div
              key={`history-skeleton-${idx}`}
              className="flex items-center gap-4 border-b border-emerald-100/10 py-4"
            >
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="collectify-main min-h-screen">
      <Reveal>
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9be7a5]">
          Tus descubrimientos
        </p>
        <h1 className="mt-3 mb-12 text-5xl font-semibold tracking-tight text-white md:text-6xl">
          {t("title")}
        </h1>
      </Reveal>
      {recomendationHistory.length > 0 ? (
        Object.entries(recomendationsGroupedByDate).map(
          ([date, recomendations]) => (
            <div key={date} className="mb-12">
              <h2 className="mb-0 border-b border-emerald-100/10 pb-3 text-xs font-bold uppercase tracking-[.16em] text-[#9be7a5]">
                {date}
              </h2>
              <Stagger
                className="border-t border-emerald-100/10"
                stagger={0.04}
              >
                {recomendations.map((recomendation: any) => (
                  <StaggerItem key={recomendation.id} y={12}>
                    <div className="grid grid-cols-[28px_58px_minmax(0,1fr)] items-center gap-3 border-b border-emerald-100/10 py-4 md:grid-cols-[28px_70px_minmax(0,1fr)_auto] md:gap-5">
                      <span className="text-xs text-[#8f9f93]" />

                      <img
                        src={recomendation.album.images[0].url}
                        alt={recomendation.album.name}
                        className="h-14 w-14 rounded-lg object-cover md:h-[70px] md:w-[70px]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white md:text-base">
                          {recomendation.album.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#8f9f93]">
                          {recomendation.album.artists[0]?.name ||
                            "Artista desconocido"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <p className="flex items-center gap-1 text-xs text-[#8f9f93]">
                            <CiClock2 />
                            {` ${formatTime(recomendation.providedAt)}`}
                          </p>
                          <p className="flex items-center text-xs text-[#8f9f93]">
                            <TbMoodHappy />
                            {recomendation.moods.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-1">
                        <button
                          className="w-full rounded-xl bg-[#9be7a5] px-4 py-2.5 text-xs font-semibold text-[#102117] transition hover:bg-[#d6f28d] md:w-auto"
                          onClick={() =>
                            openSpotify(
                              recomendation.album.external_urls.spotify,
                            )
                          }
                        >
                          {tModal("listenOnSpotify")}
                        </button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          ),
        )
      ) : (
        <section className="max-w-xl rounded-2xl border border-emerald-100/10 bg-[#17261c]/45 p-7 text-center">
          <span className="text-3xl text-[#9be7a5]">◇</span>
          <h2 className="mt-4 text-xl font-semibold text-white">
            {t("noHistory")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8f9f93]">
            Cuando recibas una recomendación, quedará guardada aquí para volver
            a ella.
          </p>
        </section>
      )}
    </main>
  );
}
