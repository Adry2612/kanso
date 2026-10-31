"use client";
import { useRecommendation } from "@/hooks/client/useRecommendation";
import { getActivityLabel } from "@/utils/recommendations";
import { useTranslations } from "@/context/I18nContext";
import { useTransitionRouter } from "next-view-transitions";
import { Reveal } from "@/components/motion";
import { getMood } from "@/constants/moods";
import { getActivity } from "@/constants/activities";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";
import AlbumShowcase from "@/components/album/AlbumShowcase";
import RecommendationFeedback from "@/components/album/RecommendationFeedback";
import VinylCrateLoader from "@/components/album/VinylCrateLoader";
import RecommendationFilterSummary from "@/app/home/components/RecommendationFilterSummary";
import RecommendationExplain from "@/app/home/components/RecommendationExplain";
import { Skeleton } from "@/components/Skeleton";
import { openSpotify } from "@/lib/spotifyUtils";
import { FaSpotify } from "react-icons/fa";
import { useEffect } from "react";

type RecomendationsProps = {
  moods: string[];
  userId: string;
  activity?: string | null;
  format?: string;
  tags?: string[];
  /** Indica que el resultado viene de «Recomendación rápida». */
  isQuick?: boolean;
};

export default function RecomendationPage({
  moods,
  userId,
  activity = null,
  format = "all",
  tags = [],
  isQuick = false,
}: RecomendationsProps) {
  const tMoods = useTranslations("moods");
  const tActivities = useTranslations("activities");
  const tRecomendation = useTranslations("recommendation");
  const tCommon = useTranslations("common");
  const router = useTransitionRouter();
  const activityLabel = activity
    ? getActivityLabel(activity, tActivities)
    : null;
  const activityEmoji = activity ? getActivity(activity)?.emoji : undefined;
  const {
    mounted,
    loading,
    error,
    noMatch,
    collectionEmpty,
    recommendedAlbum: recomendedAlbum,
    explain,
    albumTracklist,
    tracklistLoading,
  } = useRecommendation({
    moods,
    userId,
    activity,
    format,
    tags,
    activityLabel,
  });

  const debugTools = process.env.NEXT_PUBLIC_RECOMMENDATION_DEBUG === "true";

  useEffect(() => {
    if (!debugTools || !explain) return;
    // eslint-disable-next-line no-console -- herramienta de desarrollo tras flag
    console.debug("[recommendation] explicación", explain);
  }, [debugTools, explain]);

  const isLoading = loading;
  const activeError = error;

  if (!mounted || isLoading) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="pt-12 md:pt-16" role="status" aria-busy="true">
          <span className="sr-only">{tCommon("loading")}</span>
          <Skeleton className="h-3 w-24" />
          <div className="mt-8 grid gap-8 border-b border-[var(--kanso-line)] pb-10 md:grid-cols-[320px_1fr] md:gap-16">
            <VinylCrateLoader className="aspect-square w-full max-w-[320px]" />
            <div className="space-y-4 pt-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-16 w-4/5" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>
          <div className="mt-10 max-w-2xl space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (activeError) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="pt-12 md:pt-16">
          <ErrorState
            variant="page"
            title={tRecomendation("empty.errorTitle")}
            description={tRecomendation("empty.errorDescription")}
            onRetry={() => window.location.reload()}
            action={
              <button
                onClick={() => window.history.back()}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)] hover:text-[var(--foreground)]"
              >
                ← {tRecomendation("empty.back")}
              </button>
            }
          />
        </div>
      </main>
    );
  }

  if (noMatch) {
    const collectionIsEmpty = collectionEmpty === true;
    return (
      <main className="kanso-main min-h-screen">
        <div className="pt-16">
          <Reveal className="mx-auto max-w-xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              {collectionIsEmpty
                ? tRecomendation("empty.noCollectionEyebrow")
                : tRecomendation("empty.eyebrow")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
              {collectionIsEmpty
                ? tRecomendation("empty.noCollectionTitle")
                : tRecomendation("empty.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
              {collectionIsEmpty
                ? tRecomendation("empty.noCollectionDescription")
                : tRecomendation("empty.description")}
            </p>
            {!collectionIsEmpty && moods.length > 0 && (
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {moods.map((mood) => {
                  const option = getMood(mood);
                  return (
                    <span
                      key={mood}
                      className="flex items-center gap-2 rounded-full border border-[var(--kanso-line)] px-3 py-1.5 text-xs text-[var(--kanso-muted)]"
                    >
                      <span
                        aria-hidden="true"
                        className="text-[var(--kanso-mint)]"
                      >
                        {option?.emoji ?? "🎵"}
                      </span>
                      {option ? tMoods(option.key) : mood}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/search")}
                className="rounded-xl bg-[var(--kanso-mint)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
              >
                {collectionIsEmpty
                  ? tRecomendation("empty.noCollectionCta")
                  : tRecomendation("empty.cta")}
              </button>
              <button
                onClick={() => window.history.back()}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm text-[var(--kanso-muted)] transition hover:border-[var(--kanso-mint)] hover:text-[var(--foreground)]"
              >
                {tRecomendation("empty.back")}
              </button>
            </div>
          </Reveal>
        </div>
      </main>
    );
  }

  const albumInfo = recomendedAlbum?.albumInfo;
  if (!albumInfo) return null;

  return (
    <AlbumShowcase
      album={{
        id: recomendedAlbum.albumId,
        name: albumInfo.name,
        images: albumInfo.images,
        artists: albumInfo.artists,
      }}
      eyebrow="Recomendación para ti"
      description={
        <>
          Un álbum seleccionado a partir de tu{" "}
          {activity
            ? `actividad: ${activityEmoji ? `${activityEmoji} ` : ""}${activityLabel || activity}`
            : "estado de ánimo y tu colección"}
          .
        </>
      }
      actions={
        <>
          <button
            onClick={() => openSpotify(albumInfo.external_urls?.spotify)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
          >
            <FaSpotify />
            Escuchar en Spotify
          </button>
          <RecommendationFeedback albumId={recomendedAlbum.albumId} />
        </>
      }
      meta={
        <>
          {recomendedAlbum.labeledFeelings.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2">
              {recomendedAlbum.labeledFeelings.map((mood) => {
                const item = getMood(mood);
                return (
                  <span
                    key={mood}
                    className="rounded-full border border-[var(--kanso-line)] px-3 py-1.5 text-xs text-[var(--kanso-muted)]"
                  >
                    <InlineEmoji emoji={item?.emoji} />
                    {tMoods(item?.key ?? mood)}
                  </span>
                );
              })}
            </div>
          )}
          {recomendedAlbum.activities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {recomendedAlbum.activities.map((activity) => {
                const item = getActivity(activity);
                return (
                  <span
                    key={activity}
                    className="rounded-full border border-[var(--kanso-line)] px-3 py-1.5 text-xs text-[var(--kanso-muted)]"
                  >
                    <InlineEmoji emoji={item?.emoji} />
                    {tActivities(item?.id ?? activity)}
                  </span>
                );
              })}
            </div>
          )}
        </>
      }
      onBack={() => window.history.back()}
      backLabel="Volver"
      aboveHero={
        <>
          {isQuick && (
            <RecommendationFilterSummary format={format} tags={tags} />
          )}
          {debugTools && explain && <RecommendationExplain explain={explain} />}
        </>
      }
      tracks={albumTracklist}
      tracklistLoading={tracklistLoading}
    />
  );
}
