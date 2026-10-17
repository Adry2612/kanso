"use client";

import { Link, useTransitionRouter } from "next-view-transitions";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { signInAsGuest } from "@/lib/firebaseAuth";
import { getGuestSignInErrorMessage } from "@/lib/guestSignInError";
import { Reveal, Stagger, StaggerItem, motion } from "@/components/motion";

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

const albums = [
  {
    title: "Soft focus",
    detail: "Calma · Concentración",
    color: "var(--collectify-mint)",
  },
  {
    title: "Late afternoon",
    detail: "Ligero · Descubrimiento",
    color: "#c8b99a",
  },
  { title: "Night drive", detail: "Intenso · Movimiento", color: "#8ca7a0" },
];

export default function Home() {
  const { user } = useAuth();
  const router = useTransitionRouter();
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
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
            <span className="text-lg">Collectify</span>
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

        <section className="grid items-center gap-14 border-b border-[var(--collectify-line)] py-16 lg:min-h-[610px] lg:grid-cols-[.95fr_1.05fr] lg:gap-24 lg:py-20">
          <div className="max-w-xl">
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
                Collectify entiende lo que escuchas para recomendarte álbumes
                que encajan con lo que estás viviendo.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={startHref}
                    className="public-button px-6 py-3.5 text-sm"
                  >
                    Crear mi cuenta
                  </Link>
                </motion.div>
                <motion.button
                  type="button"
                  onClick={handleGuestStart}
                  disabled={isStartingGuest}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="public-button-secondary px-6 py-3.5 text-sm disabled:opacity-60"
                >
                  {isStartingGuest ? "Preparando..." : "Probar sin registrarme"}
                </motion.button>
                <Link
                  href="/login?mode=login"
                  className="public-button-secondary px-6 py-3.5 text-sm"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </Reveal>
            {guestError && (
              <div
                role="alert"
                className="mt-3 text-sm text-red-600 dark:text-red-300"
              >
                <p>{guestError}</p>
                <Link
                  href="/login?mode=register"
                  className="mt-1 inline-block font-semibold underline"
                >
                  Crear una cuenta
                </Link>
              </div>
            )}
          </div>
          <Reveal delay={0.18} y={30}>
            <div className="surface-raised public-card overflow-hidden p-5 sm:p-7">
              <div className="flex items-start justify-between border-b border-[var(--collectify-line)] pb-5">
                <div>
                  <p className="public-accent text-xs font-bold uppercase tracking-[.18em]">
                    Una muestra de tu espacio
                  </p>
                  <h2 className="display mt-2 text-2xl">Para escuchar ahora</h2>
                </div>
                <span className="public-muted text-xs">03 álbumes</span>
              </div>
              <Stagger
                className="divide-y divide-[var(--collectify-line)]"
                stagger={0.09}
              >
                {albums.map((album, index) => (
                  <StaggerItem key={album.title}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-4 py-5"
                    >
                      <div
                        className="flex h-16 w-16 shrink-0 items-end justify-end rounded-[var(--radius-xs)] p-2 shadow-[0_10px_30px_-12px_hsl(var(--shadow-tint)/0.9)]"
                        style={{
                          background: `linear-gradient(145deg, ${album.color}, var(--background))`,
                        }}
                      >
                        <span className="text-xs font-bold opacity-70">
                          0{index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-medium tracking-[-.03em]">
                          {album.title}
                        </h3>
                        <p className="public-muted mt-1 text-sm">
                          {album.detail}
                        </p>
                      </div>
                      <span className="public-muted ml-auto text-lg">↗</span>
                    </motion.div>
                  </StaggerItem>
                ))}
              </Stagger>
              <div className="public-muted flex items-center justify-between border-t border-[var(--collectify-line)] pt-5 text-xs">
                <span>Basado en tu colección</span>
                <span className="public-accent">Personalizado</span>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <div>
                <p className="public-accent text-xs font-bold uppercase tracking-[.2em]">
                  Cómo funciona Collectify
                </p>
                <h2 className="display mt-3 max-w-sm text-3xl">
                  Tu forma de escuchar es el punto de partida.
                </h2>
                <p className="public-muted mt-5 max-w-sm text-sm leading-6">
                  Collectify combina tu estado de ánimo, tus actividades y los
                  álbumes que guardas para ayudarte a descubrir música nueva sin
                  perder tu identidad.
                </p>
              </div>
            </Reveal>
            <Stagger className="grid gap-7 sm:grid-cols-3" stagger={0.1}>
              {startingPoints.map((point) => (
                <StaggerItem key={point.number}>
                  <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.99 }}>
                    <Link
                      href={startHref}
                      className="group block border-t border-[var(--collectify-line)] pt-4"
                    >
                      <span className="public-accent text-xs font-bold">
                        {point.number}
                      </span>
                      <h3 className="mt-8 text-base font-semibold leading-5 tracking-[-.02em] transition group-hover:text-[var(--collectify-mint)]">
                        {point.title}
                      </h3>
                      <p className="public-muted mt-3 text-sm leading-6">
                        {point.body}
                      </p>
                      <span className="mt-6 block text-lg transition group-hover:translate-x-1">
                        →
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
