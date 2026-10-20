/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Headphones } from "lucide-react";
import { Link } from "next-view-transitions";
import { useTranslations } from "@/context/I18nContext";
import { normalizeMoods } from "@/constants/moods";
import { formatTime } from "@/utils/dateHelpers";
import { openSpotify } from "@/lib/spotifyUtils";
import { Stagger, StaggerItem } from "@/components/motion";

export type HistoryItem = {
  id: string;
  providedAt: string;
  moods?: string[];
  album: {
    id: string;
    name: string;
    images: { url: string }[];
    artists: { name: string }[];
    external_urls?: { spotify?: string };
  };
};

type HistoryCarouselProps = {
  date: string;
  items: HistoryItem[];
};

/**
 * Una fila por fecha: el carrusel reduce la densidad de la rejilla y deja
 * respirar las portadas. Las flechas solo aparecen donde hay ratón; en táctil
 * el gesto horizontal es suficiente.
 */
export default function HistoryCarousel({ date, items }: HistoryCarouselProps) {
  const t = useTranslations("history");
  const tMoods = useTranslations("moods");
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(
      rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateControls();
    const rail = railRef.current;
    if (!rail) return;

    rail.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      rail.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [updateControls, items.length]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 240),
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-[var(--kanso-line)] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--kanso-mint)]" />
          <h2 className="text-xs font-bold uppercase tracking-[.16em] text-[var(--kanso-mint)]">
            {date}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--kanso-muted)]">
            {items.length}{" "}
            {t(
              items.length === 1 ? "stats.totalOne" : "stats.total",
            ).toLowerCase()}
          </span>
          {(canScrollLeft || canScrollRight) && (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => scroll(-1)}
                disabled={!canScrollLeft}
                aria-label={t("previous")}
                className="history-rail-control"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                disabled={!canScrollRight}
                aria-label={t("next")}
                className="history-rail-control"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={railRef} className="history-rail mt-5">
        <Stagger className="history-rail-track" stagger={0.03} onMount>
          {items.map((item) => {
            const itemMoods = normalizeMoods(item.moods ?? []);

            return (
              <StaggerItem key={item.id} y={12}>
                <article className="group min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)]">
                    <Link
                      href={`/albums/${item.album.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={item.album.name}
                    />
                    <img
                      loading="lazy"
                      decoding="async"
                      src={item.album.images[0]?.url}
                      alt={item.album.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openSpotify(item.album.external_urls?.spotify)
                      }
                      aria-label={t("listen")}
                      className="absolute bottom-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:bg-[var(--kanso-mint)] hover:text-[var(--background)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <Headphones className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-3 min-w-0">
                    <Link
                      href={`/albums/${item.album.id}`}
                      className="block truncate text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--kanso-mint)]"
                    >
                      {item.album.name}
                    </Link>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[var(--kanso-muted)]">
                      <span className="truncate">
                        {item.album.artists[0]?.name || t("unknownArtist")}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <Clock3 className="h-3 w-3" aria-hidden="true" />
                        {formatTime(item.providedAt)}
                      </span>
                    </p>
                    {itemMoods.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {itemMoods.slice(0, 2).map((mood) => (
                          <span
                            key={mood}
                            className="rounded-full bg-[var(--kanso-mint)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-mint)]"
                          >
                            {tMoods(mood)}
                          </span>
                        ))}
                        {itemMoods.length > 2 && (
                          <span className="rounded-full border border-[var(--kanso-line)] px-2 py-0.5 text-[10px] font-semibold text-[var(--kanso-muted)]">
                            +{itemMoods.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
