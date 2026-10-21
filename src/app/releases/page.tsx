/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import { ReleaseGridSkeleton } from "@/components/ContentSkeletons";
import { Stagger, StaggerItem } from "@/components/motion";
import { getArtistReleases, type ArtistRelease } from "@/lib/api/artists";
import ErrorState from "@/components/ErrorState";

export default function ReleasesPage() {
  const t = useTranslations("releases");
  const { user } = useAuth();
  const router = useTransitionRouter();
  const [releases, setReleases] = useState<ArtistRelease[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setReleases([]);
      return;
    }

    let cancelled = false;
    setReleases(null);
    setError(null);

    getArtistReleases()
      .then((items) => {
        if (!cancelled) setReleases(items);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setReleases([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, reloadToken]);

  const groups = useMemo(() => {
    const byMonth = new Map<string, ArtistRelease[]>();
    (releases ?? []).forEach((release) => {
      const month = (release.releaseDate || "").slice(0, 7);
      if (!month) return;
      const list = byMonth.get(month) ?? [];
      list.push(release);
      byMonth.set(month, list);
    });
    return Array.from(byMonth.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [releases]);

  const formatMonth = (month: string) => {
    const [year, monthIndex] = month.split("-");
    return new Date(Number(year), Number(monthIndex) - 1, 1).toLocaleDateString(
      undefined,
      { month: "long", year: "numeric" },
    );
  };

  const typeLabel = (release: ArtistRelease) => {
    if (release.albumType === "album") return t("typeAlbum");
    if (release.albumType === "single") {
      return (release.totalTracks ?? 0) >= 3 ? t("typeEp") : t("typeSingle");
    }
    return t("typeRelease");
  };

  return (
    <main className="kanso-main min-h-screen">
      <section className="max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
          {t("eyebrow")}
        </p>
        <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
          {t("subtitle")}
        </p>
      </section>

      <div className="w-full max-w-6xl pb-16">
        {releases === null && (
          <div className="mt-9" role="status" aria-busy="true">
            <span className="sr-only">{t("loading")}</span>
            <ReleaseGridSkeleton />
          </div>
        )}

        {error && (
          <ErrorState
            className="mt-9"
            title={t("error")}
            description={t("errorDescription")}
            onRetry={() => setReloadToken((value) => value + 1)}
          />
        )}

        {releases !== null && !error && groups.length === 0 && (
          <p className="mt-9 rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("empty")}
          </p>
        )}

        {groups.map(([month, items]) => (
          <section key={month} className="mt-10">
            <h2 className="mb-5 text-lg font-semibold capitalize tracking-tight text-[var(--foreground)]">
              {formatMonth(month)}
            </h2>
            <Stagger
              className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
              stagger={0.04}
              onMount
            >
              {items.map((release) => (
                <StaggerItem key={release.id} className="h-full">
                  <article
                    onClick={() => router.push(`/albums/${release.id}`)}
                    className="kanso-card group flex h-full w-full cursor-pointer flex-col p-2"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xs)]">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={release.images[0]?.url}
                        alt={release.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
                      <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                        {release.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[var(--kanso-muted)]">
                        {release.artists[0]?.name}
                      </span>
                      <span className="mt-auto flex items-center gap-2 pt-3 text-[11px] font-semibold uppercase tracking-[.14em] text-[var(--kanso-mint)]">
                        {typeLabel(release)}
                        <span className="text-[var(--kanso-muted)]">
                          {release.releaseDate}
                        </span>
                      </span>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ))}
      </div>
    </main>
  );
}
