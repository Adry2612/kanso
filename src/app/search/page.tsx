/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SelectedAlbumModal from "@/app/search/components/SelectedAlbumModal/SelectedAlbumModal";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import { Album } from "../../../models/album";
import { useTranslations } from "@/context/I18nContext";
import AlbumCard from "@/components/AlbumCard";
import { useAuth } from "@/context/AuthContext";
import { getMood, normalizeMoods } from "@/constants/moods";
import { Link } from "next-view-transitions";
import { Stagger, StaggerItem } from "@/components/motion";

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
    fetch(`/api/userFavorites?userId=${encodeURIComponent(user.uid)}`)
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
    const fetchData = async () => {
      if (!debouncedQuery) {
        setResult(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedQuery)}`,
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error fetching data");
        }
        const data = await res.json();
        setResult(data);
      } catch (err: any) {
        setError(err.message);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery]);

  return (
    <main className="collectify-main min-h-screen">
      <section className="mt-12 flex max-w-5xl flex-col justify-between gap-7 md:mt-20 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#9be7a5]">
            Explora tu próxima escucha
          </p>
          <h1 className="collectify-page-title !mt-3 !text-5xl md:!text-6xl">
            {t("title")}
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#8f9f93]">
          {t("subtitle")}
        </p>
      </section>
      <input
        type="text"
        placeholder={t("placeholder")}
        value={query}
        onChange={handleInputChange}
        className="collectify-input mt-9 mb-12 w-full max-w-2xl px-5 py-4 text-sm placeholder:text-[#617164]"
      />

      {loading && <p className="text-sm text-[#8f9f93]">{t("loading")}</p>}
      {error && <p className="text-sm text-[#ff9f76]">{error}</p>}

      <div className="w-full max-w-6xl pb-16">
        {mounted && result && (
          <>
            <h2 className="mb-5 text-lg font-semibold tracking-tight text-[#f2f5ef]">
              {t("resultsTitle")}:{" "}
              <span className="text-[#9be7a5]">{debouncedQuery}</span>
            </h2>

            {result.albums?.items?.length > 0 ? (
              <Stagger
                className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                stagger={0.04}
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
              <p className="rounded-xl border border-emerald-100/10 bg-[#17261c]/45 p-5 text-sm text-[#b4c2b6]">
                {t("noAlbumsFound")}
              </p>
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
            <div className="rounded-2xl border border-emerald-100/10 bg-[#17261c]/45 p-5 sm:p-7">
              <p className="text-sm leading-relaxed text-[#b4c2b6]">
                {t("emptySearchPrompt")}
              </p>
              {collectionMoods.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-base font-semibold text-white">
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
                          className="rounded-full border border-emerald-100/15 bg-[#101b14]/50 px-3 py-2 text-sm text-[#d6e5d8] transition hover:border-[#9be7a5]/60 hover:text-[#9be7a5]"
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
                  <h2 className="text-base font-semibold text-white">
                    Explora por tus etiquetas
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collectionTags.map((tag) => (
                      <button
                        key={`${tag.category}-${tag.value}`}
                        type="button"
                        onClick={() => setQuery(tag.value)}
                        className="rounded-full border border-emerald-100/15 bg-[#101b14]/50 px-3 py-2 text-sm text-[#d6e5d8] transition hover:border-[#9be7a5]/60 hover:text-[#9be7a5]"
                      >
                        {tag.category}: {tag.value}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!favoritesLoaded && (
                <p className="mt-5 text-sm text-[#8f9f93]">
                  {t("loadingCollection")}
                </p>
              )}
              {favoritesError && (
                <p role="alert" className="mt-5 text-sm text-[#ff9f76]">
                  {t("collectionLoadError")}
                </p>
              )}
              {favoritesLoaded &&
                !favoritesError &&
                collectionMoods.length === 0 &&
                collectionTags.length === 0 && (
                  <p className="mt-5 text-sm leading-relaxed text-[#8f9f93]">
                    {favoritesByAlbum.size === 0 ? (
                      <>
                        {t("emptyCollection")}{" "}
                        <Link
                          href="/favorites"
                          className="font-semibold text-[#9be7a5] underline"
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
