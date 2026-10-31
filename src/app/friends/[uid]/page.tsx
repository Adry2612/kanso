/* eslint-disable @next/next/no-img-element -- portadas del CDN de Spotify */
"use client";

import { useParams } from "next/navigation";
import { Link } from "next-view-transitions";
import {
  ArrowLeft,
  ChevronDown,
  Disc3,
  Music2,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import ArtistCard from "@/components/ArtistCard";
import FriendAvatar from "@/components/FriendAvatar";
import SharedAlbumCard from "@/components/SharedAlbumCard";
import { Skeleton } from "@/components/Skeleton";
import { Reveal } from "@/components/motion";
import { useFriendLibrary } from "@/hooks/client/useFriendLibrary";
import { friendLoginHref } from "@/utils/friends";
import { formatTime } from "@/utils/dateHelpers";
import { openSpotify } from "@/lib/spotifyUtils";
import { getMood } from "@/constants/moods";
import InlineEmoji from "@/components/InlineEmoji";
import ErrorState from "@/components/ErrorState";

export default function SharedFriendProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = String(params?.uid ?? "");
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("friends");
  const tMoods = useTranslations("moods");

  const {
    data,
    loading,
    notFound,
    error,
    recommendationGroups,
    availableSections,
    activeSection,
    activeTotal,
    canShowMore,
    visibleCount,
    totalRecommendations,
    totalCollection,
    totalArtists,
    reload,
    selectSection,
    showMore,
  } = useFriendLibrary(uid);

  if (authLoading || (loading && !data)) {
    return (
      <main className="kanso-main min-h-screen">
        <Skeleton className="h-4 w-32" />
        <div className="mt-8 flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-48 max-w-full" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-2xl" />
          ))}
        </div>
      </main>
    );
  }

  if (!user || user.isAnonymous) {
    const isGuest = Boolean(user?.isAnonymous);

    return (
      <main className="kanso-main min-h-screen">
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--kanso-mint)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("profile.back")}
        </Link>

        <Reveal>
          <section className="kanso-panel mt-8 max-w-2xl p-6 md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-mint)]">
              <UsersRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {isGuest ? t("profile.guestTitle") : t("profile.noSessionTitle")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
              {isGuest
                ? t("profile.guestDescription")
                : t("profile.noSessionDescription")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={friendLoginHref(`/friends/${uid}`, "register")}
                className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
              >
                {t("profile.register")}
              </Link>
              <Link
                href={friendLoginHref(`/friends/${uid}`, "login")}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
              >
                {t("profile.login")}
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="kanso-main min-h-screen">
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--kanso-mint)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("profile.back")}
        </Link>

        <section className="kanso-panel mt-8 max-w-2xl p-6 text-center md:p-8">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-muted)]">
            <UsersRound className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {t("profile.unavailableTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("profile.unavailableDescription")}
          </p>
          <Link
            href="/friends"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("profile.backToList")}
          </Link>
        </section>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="kanso-main min-h-screen">
        <Link
          href="/friends"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--kanso-mint)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("profile.back")}
        </Link>

        <ErrorState
          className="mt-8"
          title={t("loadError")}
          description={t("loadErrorDescription")}
          onRetry={() => void reload()}
          retryLabel={t("profile.retry")}
        />
      </main>
    );
  }

  const hasRecommendations = data.recommendations !== undefined;
  const hasCollection = data.collection !== undefined;
  const hasArtists = data.artists !== undefined;
  const hasAnySection = hasRecommendations || hasCollection || hasArtists;

  const sectionTabs = [
    {
      id: "recommendations" as const,
      label: t("profile.recommendationsTitle"),
      icon: Music2,
    },
    {
      id: "collection" as const,
      label: t("profile.collectionTitle"),
      icon: Disc3,
    },
    {
      id: "artists" as const,
      label: t("profile.artistsTitle"),
      icon: UsersRound,
    },
  ].filter((tab) => availableSections.includes(tab.id));

  const activeTab = sectionTabs.find((tab) => tab.id === activeSection) ?? null;
  const ActiveIcon = activeTab?.icon ?? Disc3;

  const sharedNote = t("profile.sharedNote").replace(
    "{name}",
    data.profile.displayName,
  );

  return (
    <main className="kanso-main min-h-screen">
      <Link
        href="/friends"
        className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--kanso-mint)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t("profile.back")}
      </Link>

      <Reveal>
        <header className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
          <FriendAvatar
            displayName={data.profile.displayName}
            photoURL={data.profile.photoURL}
            size="lg"
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              {t("profile.eyebrow")}
            </p>
            <h1 className="mt-2 truncate text-4xl font-semibold tracking-[-.04em] text-[var(--foreground)] md:text-5xl">
              {data.profile.displayName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
              {sharedNote}
            </p>
          </div>
        </header>
      </Reveal>

      {!hasAnySection && (
        <Reveal delay={0.05}>
          <section className="kanso-panel mt-10 max-w-2xl p-6 text-center md:p-8">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-muted)]">
              <Disc3 className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {t("profile.nothingTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
              {t("profile.nothingDescription").replace(
                "{name}",
                data.profile.displayName,
              )}
            </p>
            <Link
              href="/friends"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("profile.backToList")}
            </Link>
          </section>
        </Reveal>
      )}

      {hasAnySection && activeSection && activeTab && (
        <>
          <div
            role="group"
            aria-label={t("profile.sectionsLabel")}
            className="mt-10 flex max-w-full flex-wrap gap-1 rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/50 p-1"
          >
            {sectionTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeSection;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectSection(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[var(--kanso-mint)] text-[var(--background)]"
                      : "text-[var(--kanso-muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Reveal key={activeSection} delay={0.05} amount="some">
            <section
              className={`mt-6 ${
                activeSection === "collection" ? "max-w-6xl" : "max-w-4xl"
              }`}
              aria-label={activeTab.label}
            >
              <div className="flex items-center gap-2 border-b border-[var(--kanso-line)] pb-3">
                <ActiveIcon
                  className="h-4 w-4 text-[var(--kanso-mint)]"
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                  {activeTab.label}
                </h2>
                {activeTotal > 0 && (
                  <span className="ml-auto text-xs font-semibold text-[var(--kanso-muted)]">
                    {activeTotal}
                  </span>
                )}
              </div>

              {activeSection === "recommendations" &&
                (totalRecommendations > 0 ? (
                  Object.entries(recommendationGroups).map(([date, items]) => (
                    <div key={date} className="mt-7">
                      <h3 className="text-xs font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
                        {date}
                      </h3>
                      <div className="mt-2 border-t border-[var(--kanso-line)]">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--kanso-line)] py-4 sm:grid-cols-[64px_minmax(0,1fr)_auto]"
                          >
                            <img
                              loading="lazy"
                              decoding="async"
                              src={item.album.images[0]?.url}
                              alt={item.album.name}
                              className="h-14 w-14 rounded-lg object-cover sm:h-16 sm:w-16"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                                {item.album.name}
                              </p>
                              <p className="mt-1 truncate text-xs text-[var(--kanso-muted)]">
                                {item.album.artists
                                  .map((artist) => artist.name)
                                  .join(" · ")}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="text-xs text-[var(--kanso-muted)]">
                                  {formatTime(item.providedAt)}
                                </span>
                                {item.moods.length > 0 && (
                                  <span className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-[var(--kanso-muted)]">
                                    {item.moods.map((mood) => (
                                      <span key={mood}>
                                        <InlineEmoji
                                          emoji={getMood(mood)?.emoji}
                                        />
                                        {tMoods(mood)}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.album.spotifyUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  openSpotify(item.album?.spotifyUrl)
                                }
                                className="col-span-2 rounded-lg bg-[var(--kanso-mint)] px-3 py-2 text-xs font-semibold text-[var(--background)] transition hover:brightness-105 sm:col-span-1 sm:w-auto"
                              >
                                {t("profile.listen")}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="kanso-empty mt-5 rounded-xl border border-dashed border-[var(--kanso-line)] p-5 text-sm text-[var(--kanso-muted)]">
                    {t("profile.recommendationsEmpty")}
                  </p>
                ))}

              {activeSection === "collection" &&
                (totalCollection > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
                    {(data.collection ?? [])
                      .slice(0, visibleCount)
                      .map((item) => (
                        <SharedAlbumCard key={item.id} item={item} />
                      ))}
                  </div>
                ) : (
                  <p className="kanso-empty mt-5 rounded-xl border border-dashed border-[var(--kanso-line)] p-5 text-sm text-[var(--kanso-muted)]">
                    {t("profile.collectionEmpty")}
                  </p>
                ))}

              {activeSection === "artists" &&
                (totalArtists > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {(data.artists ?? [])
                      .slice(0, visibleCount)
                      .map((artist) => (
                        <ArtistCard
                          key={artist.id}
                          artist={artist}
                          isFavorite={false}
                        />
                      ))}
                  </div>
                ) : (
                  <p className="kanso-empty mt-5 rounded-xl border border-dashed border-[var(--kanso-line)] p-5 text-sm text-[var(--kanso-muted)]">
                    {t("profile.artistsEmpty")}
                  </p>
                ))}

              {canShowMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={showMore}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50 hover:text-[var(--kanso-mint)]"
                  >
                    {t("profile.loadMore")}
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </section>
          </Reveal>
        </>
      )}
    </main>
  );
}
