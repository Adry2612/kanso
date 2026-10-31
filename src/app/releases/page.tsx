"use client";

import { useTranslations } from "@/context/I18nContext";
import AlbumCard from "@/components/AlbumCard";
import { ReleaseGridSkeleton } from "@/components/ContentSkeletons";
import { Stagger, StaggerItem } from "@/components/motion";
import ErrorState from "@/components/ErrorState";
import { useArtistReleases } from "@/hooks/client/useArtistReleases";
import { formatReleaseMonth, getReleaseTypeKey } from "@/utils/releases";
import type { ArtistRelease } from "@/types/artists";

export default function ReleasesPage() {
  const t = useTranslations("releases");
  const { releases, groups, error, reload } = useArtistReleases();

  const typeLabel = (release: ArtistRelease) => t(getReleaseTypeKey(release));

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

      <div className="w-full pb-16">
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
            onRetry={reload}
          />
        )}

        {releases !== null && !error && groups.length === 0 && (
          <p className="kanso-empty mt-9 max-w-2xl rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("empty")}
          </p>
        )}

        {groups.map(([month, items]) => (
          <section key={month} className="mt-10">
            <h2 className="mb-5 text-lg font-semibold capitalize tracking-tight text-[var(--foreground)]">
              {formatReleaseMonth(month)}
            </h2>
            <Stagger
              className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
              stagger={0.04}
              onMount
            >
              {items.map((release) => (
                <StaggerItem key={release.id} className="h-full">
                  <AlbumCard
                    album={release}
                    className="flex h-full flex-col"
                    footer={
                      <span className="mt-auto flex items-center gap-2 pt-3 text-[11px] font-semibold uppercase tracking-[.14em] text-[var(--kanso-mint)]">
                        {typeLabel(release)}
                        <span className="text-[var(--kanso-muted)]">
                          {release.releaseDate}
                        </span>
                      </span>
                    }
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ))}
      </div>
    </main>
  );
}
