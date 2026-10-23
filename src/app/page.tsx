"use client";

/* eslint-disable @next/next/no-img-element -- portadas del CDN de Spotify */
import { Link, useTransitionRouter } from "next-view-transitions";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLandingAlbums } from "@/hooks/client/useLandingAlbums";
import { signInAsGuest } from "@/lib/firebaseAuth";
import { getGuestSignInErrorMessage } from "@/lib/guestSignInError";
import { Reveal, Stagger, StaggerItem, motion } from "@/components/motion";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";

const startingPoints = [
  {
    number: "01",
    title: "Elige tu momento",
    body: "Dinos cómo te sientes o qué vas a hacer.",
  },
  {
    number: "02",
    title: "Conectamos tu colección",
    body: "Comparamos ese contexto con tus favoritos.",
  },
  {
    number: "03",
    title: "Descubre un álbum",
    body: "Recibe una recomendación pensada para ti.",
  },
];

function LandingAlbumsSkeleton() {
  return (
    <div className="divide-y divide-[var(--kanso-line)]" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex items-center gap-4 py-5">
          <Skeleton className="h-16 w-16 shrink-0 rounded-[var(--radius-xs)]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const router = useTransitionRouter();
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const {
    albums: landingAlbums,
    error: albumsError,
    reload: loadLandingAlbums,
  } = useLandingAlbums();
  const startHref = user ? "/home" : "/login?mode=register";

  const handleGuestStart = async () => {
    setGuestError(null);
    setIsStartingGuest(true);
    try {
      await signInAsGuest();
      router.push("/home");
    } catch (error: unknown) {
      setGuestError(getGuestSignInErrorMessage(error));
    } finally {
      setIsStartingGuest(false);
    }
  };

  return (
    <main className="public-page relative">
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-12">
        <header className="public-header flex items-center justify-between pb-5">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight"
          >
            <Image
              src="/kanso-logo.png"
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 max-w-none shrink-0"
            />
            <span className="text-lg">Kanso</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/login?mode=login"
              className="public-muted hidden text-sm transition hover:text-[var(--foreground)] sm:block"
            >
              Iniciar sesión
            </Link>
            <Link
              href={startHref}
              className="public-button px-4 py-2.5 text-sm"
            >
              Empezar
            </Link>
          </nav>
        </header>

        <section className="grid grid-cols-1 items-center gap-14 border-b border-[var(--kanso-line)] py-16 lg:min-h-[610px] lg:grid-cols-[.95fr_1.05fr] lg:gap-24 lg:py-20">
          <div className="min-w-0 max-w-xl">
            <Reveal delay={0.02}>
              <p className="public-accent text-xs font-bold uppercase tracking-[.2em]">
                Tu colección, con más posibilidades
              </p>
            </Reveal>
            <Reveal delay={0.08} y={28}>
              <h1 className="display mt-5 text-5xl sm:text-6xl lg:text-[5.25rem]">
                No busques una canción.{" "}
                <span className="public-accent">Encuentra un momento.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="public-muted mt-7 max-w-md text-base leading-7 sm:text-lg">
                Kanso entiende lo que escuchas para recomendarte álbumes que
                encajan con lo que estás viviendo.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={startHref}
                  className="public-button inline-flex min-h-12 flex-1 items-center justify-center px-6 py-3.5 text-center text-sm"
                >
                  Crear mi cuenta
                </Link>
                <button
                  type="button"
                  onClick={handleGuestStart}
                  disabled={isStartingGuest}
                  className="public-button-secondary inline-flex min-h-12 flex-1 items-center justify-center px-6 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isStartingGuest ? "Preparando..." : "Probar sin registrarme"}
                </button>
              </div>
              <Link
                href="/login?mode=login"
                className="public-muted mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition hover:text-[var(--foreground)]"
              >
                Ya tengo cuenta
                <span aria-hidden="true">{"\u2192\uFE0E"}</span>
              </Link>
            </Reveal>
            {guestError && (
              <ErrorState
                variant="inline"
                className="mt-4"
                title="No pudimos preparar tu sesión de prueba"
                description={guestError}
                action={
                  <Link
                    href="/login?mode=register"
                    className="text-xs font-semibold text-[var(--kanso-mint)] underline-offset-2 hover:underline"
                  >
                    Crear una cuenta
                  </Link>
                }
              />
            )}
          </div>
          <Reveal delay={0.18} y={30} className="min-w-0">
            <div className="surface-raised public-card overflow-hidden p-5 sm:p-7">
              <div className="flex items-start justify-between border-b border-[var(--kanso-line)] pb-5">
                <div>
                  <p className="public-accent text-xs font-bold uppercase tracking-[.18em]">
                    Una muestra de tu espacio
                  </p>
                  <h2 className="display mt-2 text-2xl">Para escuchar ahora</h2>
                </div>
                <span className="public-muted text-xs">
                  {landingAlbums === null
                    ? "—"
                    : `${String(landingAlbums.length).padStart(2, "0")} álbumes`}
                </span>
              </div>

              {landingAlbums === null && <LandingAlbumsSkeleton />}

              {albumsError && (
                <ErrorState
                  variant="inline"
                  className="my-5"
                  title="No pudimos cargar la muestra"
                  description="La comunidad no responde ahora mismo."
                  onRetry={() => void loadLandingAlbums()}
                />
              )}

              {!albumsError && landingAlbums?.length === 0 && (
                <div className="py-8">
                  <p className="public-muted text-sm leading-6">
                    Todavía no hay álbumes compartidos. Explora el catálogo y
                    guarda el primero.
                  </p>
                  <Link
                    href="/search"
                    className="public-accent mt-3 inline-flex text-sm font-semibold"
                  >
                    Explorar discos{" "}
                    <span aria-hidden="true">{"\u2192\uFE0E"}</span>
                  </Link>
                </div>
              )}

              {!albumsError && landingAlbums && landingAlbums.length > 0 && (
                <Stagger
                  className="divide-y divide-[var(--kanso-line)]"
                  stagger={0.09}
                >
                  {landingAlbums.map((album) => (
                    <StaggerItem key={album.id}>
                      <Link
                        href={`/albums/${album.id}`}
                        className="group flex items-center gap-4 py-5 transition-transform hover:translate-x-1"
                      >
                        <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-xs)] shadow-[0_10px_30px_-12px_hsl(var(--shadow-tint)/0.9)]">
                          {album.images[0]?.url ? (
                            <img
                              loading="lazy"
                              decoding="async"
                              src={album.images[0].url}
                              alt=""
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center bg-[var(--surface-3)] text-lg text-[var(--kanso-mint)]">
                              ♪
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-lg font-medium tracking-[-.03em]">
                            {album.name}
                          </span>
                          <span className="public-muted mt-1 block truncate text-sm">
                            {album.artists
                              .map((artist) => artist.name)
                              .join(", ")}
                          </span>
                        </span>
                        <span className="public-muted ml-auto text-lg transition-transform group-hover:translate-x-0.5">
                          {"\u2197\uFE0E"}
                        </span>
                      </Link>
                    </StaggerItem>
                  ))}
                </Stagger>
              )}
              <div className="public-muted flex items-center justify-between border-t border-[var(--kanso-line)] pt-5 text-xs">
                <span>Guardados por la comunidad</span>
                <span className="public-accent">En directo</span>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="py-14 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <div>
                <p className="public-accent text-xs font-bold uppercase tracking-[.2em]">
                  Cómo funciona Kanso
                </p>
                <h2 className="display mt-3 max-w-sm text-3xl">
                  Tu forma de escuchar es el punto de partida.
                </h2>
                <p className="public-muted mt-5 max-w-sm text-sm leading-6">
                  Kanso combina tu estado de ánimo, tus actividades y los
                  álbumes que guardas para ayudarte a descubrir música nueva sin
                  perder tu identidad.
                </p>
              </div>
            </Reveal>
            <Stagger
              className="grid grid-cols-1 gap-7 sm:grid-cols-3"
              stagger={0.1}
            >
              {startingPoints.map((point) => (
                <StaggerItem key={point.number}>
                  <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      href={startHref}
                      className="group block border-t border-[var(--kanso-line)] pt-4"
                    >
                      <span className="public-accent text-xs font-bold">
                        {point.number}
                      </span>
                      <h3 className="mt-8 text-base font-semibold leading-5 tracking-[-.02em] transition group-hover:text-[var(--kanso-mint)]">
                        {point.title}
                      </h3>
                      <p className="public-muted mt-3 text-sm leading-6">
                        {point.body}
                      </p>
                      <span className="mt-6 block text-lg transition group-hover:translate-x-1">
                        {"\u2192\uFE0E"}
                      </span>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </div>
    </main>
  );
}
