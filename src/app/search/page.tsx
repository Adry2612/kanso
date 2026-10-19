/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useRef, useState } from "react";
import { Album } from "../../../models/album";
import { useTranslations } from "@/context/I18nContext";
import AlbumCard from "@/components/AlbumCard";
import { useAuth } from "@/context/AuthContext";
import { getMood, normalizeMoods } from "@/constants/moods";
import { Link } from "next-view-transitions";
import { Stagger, StaggerItem } from "@/components/motion";
import { authFetch } from "@/lib/api/authFetch";

export default function SearchPage() {
  const t = useTranslations("search");
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [favoritesError, setFavoritesError] = useState(false);
  const [communitySearches, setCommunitySearches] = useState<string[]>([]);
  const [communityAlbums, setCommunityAlbums] = useState<any[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [selectedAlbumIsFavorite, setSelectedAlbumIsFavorite] = useState(false);
  const [favoritesByAlbum, setFavoritesByAlbum] = useState<Map<string, any>>(
    new Map(),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  useEffect(() => {
    if (!user?.uid) {
      setFavoritesByAlbum(new Map());
      setFavoritesLoaded(true);
      return;
    }

    setFavoritesLoaded(false);
    setFavoritesError(false);
    authFetch("/api/userFavorites")
      .then((response) => {
        if (!response.ok) throw new Error("No se pudo cargar la colección");
        return response.json();
      })
      .then((data) => {
        const favorites = new Map<string, any>();
        (data.favorites || []).forEach((favorite: any) => {
          const albumId = favorite.album?.id || favorite.albumId;
          if (albumId) favorites.set(albumId, favorite);
        });
        setFavoritesByAlbum(favorites);
        setFavoritesLoaded(true);
      })
      .catch((error: unknown) => {
        console.error("Error al cargar la colección:", error);
        setFavoritesByAlbum(new Map());
        setFavoritesError(true);
        setFavoritesLoaded(true);
      });
  }, [user?.uid]);

  useEffect(() => {
    fetch("/api/communitySearches")
      .then((response) => (response.ok ? response.json() : { searches: [] }))
      .then((data) => {
        setCommunitySearches(
          (data.searches || [])
            .map((item: { term?: string }) => item.term)
            .filter((term: unknown): term is string => Boolean(term)),
        );
      })
      .catch(() => setCommunitySearches([]));
  }, []);

  useEffect(() => {
    fetch("/api/communityAlbums")
      .then((response) => (response.ok ? response.json() : { albums: [] }))
      .then((data) => setCommunityAlbums(data.albums || []))
      .catch(() => setCommunityAlbums([]));
  }, []);

  // Registro de la comunidad: espera a que la consulta se asiente (más que el
  // debounce de resultados), exige 3 caracteres y coalesce prefijos parciales.
  const lastRegisteredTerm = useRef<string | null>(null);

  useEffect(() => {
    const term = query.trim().replace(/\s+/g, " ");
    if (term.length < 3) return;

    const timer = setTimeout(() => {
      const normalized = term.toLocaleLowerCase("es");
      const previous = lastRegisteredTerm.current;
      if (previous === normalized) return;

      const extendsPrevious =
        previous !== null && normalized.startsWith(previous);

      lastRegisteredTerm.current = normalized;
      fetch("/api/communitySearches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term,
          previousTerm: extendsPrevious ? previous : undefined,
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [query]);

  const collectionMoods = Array.from(
    new Set(
      Array.from(favoritesByAlbum.values()).flatMap((favorite) =>
        normalizeMoods(favorite.labeledFeelings || []),
      ),
    ),
  ).slice(0, 6);
  const collectionTags = Array.from(
    new Map(
      Array.from(favoritesByAlbum.values())
        .flatMap((favorite) => favorite.tags || [])
        .map((tag: { category: string; value: string }) => [
          `${tag.category}-${tag.value}`,
          tag,
        ]),
    ).values(),
  ).slice(0, 8) as { category: string; value: string }[];

  const handleOpenModal = (album: Album) => {
    setOpenModal((prev) => !prev);
    setSelectedAlbum(album);
    setSelectedAlbumIsFavorite(favoritesByAlbum.has(album.id));
  };

  useEffect(() => {
    const term = debouncedQuery.trim();

    if (!term) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Cancelar la petición anterior: escribir rápido nunca pinta resultados viejos.
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Error fetching data");
        }
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        setError(err.message);
        setResult(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <main className="kanso-main min-h-screen">
      <section className="mt-12 flex max-w-5xl flex-col justify-between gap-7 md:mt-20 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
            Explora tu próxima escucha
          </p>
          <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
            {t("title")}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
          {t("subtitle")}
        </p>
      </section>
      <input
        type="text"
        placeholder={t("placeholder")}
        value={query}
        onChange={handleInputChange}
        className="kanso-input mt-9 mb-12 w-full max-w-2xl px-5 py-4 text-sm placeholder:text-[var(--kanso-muted)]"
      />

      {loading && (
        <p className="text-sm text-[var(--kanso-muted)]">{t("loading")}</p>
      )}
      {error && <p className="text-sm text-[var(--kanso-danger)]">{error}</p>}

      <div className="w-full max-w-6xl pb-16">
        {mounted && result && (
          <>
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {t("resultsTitle")}:{" "}
              <span className="text-[var(--kanso-mint)]">{debouncedQuery}</span>
            </h2>

            {result.albums?.items?.length > 0 ? (
              <Stagger
                className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                stagger={0.04}
                onMount
              >
                {result.albums.items.map((album: any) => (
                  <StaggerItem key={album.id}>
                    <AlbumCard
                      album={album}
                      isFavorite={favoritesByAlbum.has(album.id)}
                      onAdd={() => handleOpenModal(album)}
                    />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <section className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
                  {t("noResults")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {t("noResultsTitle")}
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("noResultsDescription")}
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-6 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-[var(--kanso-lime)]"
                >
                  {t("clearSearch")}
                </button>
                {(collectionMoods.length > 0 || collectionTags.length > 0) && (
                  <div className="mt-8 border-t border-[var(--kanso-line)] pt-6">
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      {t("tryCollection")}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {collectionMoods.map((mood) => {
                        const item = getMood(mood);
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => setQuery(item?.label || mood)}
                            className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                          >
                            {item?.symbol} {item?.label}
                          </button>
                        );
                      })}
                      {collectionTags.map((tag) => (
                        <button
                          key={`${tag.category}-${tag.value}`}
                          type="button"
                          onClick={() => setQuery(tag.value)}
                          className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                        >
                          {tag.category}: {tag.value}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
            {openModal && (
              <SelectedAlbumModal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                album={selectedAlbum}
                isFavorite={selectedAlbumIsFavorite}
                favoriteData={
                  selectedAlbum
                    ? favoritesByAlbum.get(selectedAlbum.id)
                    : undefined
                }
                onSaved={(savedFavorite) => {
                  if (selectedAlbum?.id) {
                    setFavoritesByAlbum((current) => {
                      const next = new Map(current);
                      next.set(selectedAlbum.id, savedFavorite);
                      return next;
                    });
                  }
                }}
              />
            )}
          </>
        )}
        {mounted && !result && !loading && !error && (
          <section className="mt-2 space-y-10">
            <div className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-7">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {t("communityAlbumsTitle")}
              </h2>
              {communityAlbums.length > 0 ? (
                <Stagger
                  className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  stagger={0.04}
                  onMount
                >
                  {communityAlbums.map((album) => (
                    <StaggerItem key={album.id}>
                      <AlbumCard album={album} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("communityAlbumsEmpty")}
                </p>
              )}
            </div>
            {communitySearches.length > 0 && (
              <div className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-7">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  {t("communityTitle")}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {communitySearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/45 p-5 sm:p-7">
              <p className="text-sm leading-relaxed text-[var(--kanso-muted)]">
                {t("emptySearchPrompt")}
              </p>
              {collectionMoods.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">
                    Tu colección, por emociones
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collectionMoods.map((mood) => {
                      const item = getMood(mood);
                      return (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setQuery(item?.label || mood)}
                          className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                        >
                          {item?.symbol} {item?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {collectionTags.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-[var(--foreground)]">
                    Explora por tus etiquetas
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collectionTags.map((tag) => (
                      <button
                        key={`${tag.category}-${tag.value}`}
                        type="button"
                        onClick={() => setQuery(tag.value)}
                        className="rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-1)]/50 px-3 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/60 hover:text-[var(--kanso-mint)]"
                      >
                        {tag.category}: {tag.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!favoritesLoaded && (
                <p className="mt-5 text-sm text-[var(--kanso-muted)]">
                  {t("loadingCollection")}
                </p>
              )}
              {favoritesError && (
                <p
                  role="alert"
                  className="mt-5 text-sm text-[var(--kanso-danger)]"
                >
                  {t("collectionLoadError")}
                </p>
              )}
              {favoritesLoaded &&
                !favoritesError &&
                collectionMoods.length === 0 &&
                collectionTags.length === 0 && (
                  <p className="mt-5 text-sm leading-relaxed text-[var(--kanso-muted)]">
                    {favoritesByAlbum.size === 0 ? (
                      <>
                        {t("emptyCollection")}{" "}
                        <Link
                          href="/favorites"
                          className="font-semibold text-[var(--kanso-mint)] underline"
                        >
                          {t("exploreDiscs")}
                        </Link>
                      </>
                    ) : (
                      t("collectionNeedsTags")
                    )}
                  </p>
                )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
