"use client";
import { useRecommendation } from "@/hooks/client/useRecommendation";
import { getActivityLabel } from "@/utils/recommendations";
import { useTranslations } from "@/context/I18nContext";
import { useTransitionRouter } from "next-view-transitions";
import { Reveal } from "@/components/motion";
import { getMood } from "@/constants/moods";
import { getActivity } from "@/constants/activities";
import ErrorState from "@/components/ErrorState";
import AlbumRecordPanel from "@/components/album/AlbumRecordPanel";
import AlbumShowcase from "@/components/album/AlbumShowcase";
import RecommendationFeedback from "@/components/album/RecommendationFeedback";
import VinylCrateLoader from "@/components/album/VinylCrateLoader";
import RecommendationFilterSummary from "@/app/home/components/RecommendationFilterSummary";
import RecommendationExplain from "@/app/home/components/RecommendationExplain";
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
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center"
        >
          <span className="sr-only">{tCommon("loading")}</span>
          <VinylCrateLoader
            variant="bare"
            className="h-56 w-56 max-w-full sm:h-64 sm:w-64"
          />
          <h1 className="mt-8 max-w-md text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
            {tRecomendation("loading.title")}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
            {tRecomendation("loading.description")}
          </p>
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
      aside={
        <AlbumRecordPanel
          moods={recomendedAlbum.labeledFeelings}
          activities={recomendedAlbum.activities}
          formats={recomendedAlbum.format}
          tags={recomendedAlbum.tags}
        />
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
