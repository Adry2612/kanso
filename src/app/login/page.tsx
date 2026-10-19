/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signInAsGuest, signInWithGoogle } from "../../lib/firebaseAuth";
import { getGuestSignInErrorMessage } from "@/lib/guestSignInError";

function LoginForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const googleTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisterMode = searchParams.get("mode") !== "login";
  const requestedNext = searchParams.get("next");
  const destination =
    requestedNext &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/home";
  const nextQuery =
    destination !== "/home" ? `&next=${encodeURIComponent(destination)}` : "";

  // Si el popup se queda colgado (COOP, bloqueo del navegador), el botón no
  // debe quedar deshabilitado para siempre.
  useEffect(
    () => () => {
      if (googleTimeoutRef.current)
        window.clearTimeout(googleTimeoutRef.current);
    },
    [],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isRegisterMode) {
        const displayName = name.trim();
        if (!displayName) {
          setError("Escribe tu nombre para crear la cuenta.");
          return;
        }

        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(credential.user, { displayName });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace(destination);
    } catch (err: any) {
      setError(err?.message || "No hemos podido completar la operación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setError(null);
    try {
      setIsLoggingIn(true);
      // Red de seguridad: si el popup nunca resuelve, se libera el botón.
      googleTimeoutRef.current = window.setTimeout(() => {
        setIsLoggingIn(false);
      }, 90_000);
      const user = await signInWithGoogle();
      if (user) router.replace(destination);
    } catch {
      setError("No hemos podido iniciar sesión con Google.");
    } finally {
      if (googleTimeoutRef.current) {
        window.clearTimeout(googleTimeoutRef.current);
        googleTimeoutRef.current = null;
      }
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    setError(null);
    const provider = new OAuthProvider("apple.com");
    void provider;
    setError("El acceso con Apple estará disponible próximamente.");
  };

  const handleGuestLogin = async () => {
    setError(null);
    setGuestError(null);
    setIsStartingGuest(true);
    try {
      await signInAsGuest();
      router.replace(destination);
    } catch (error: unknown) {
      setGuestError(getGuestSignInErrorMessage(error));
    } finally {
      setIsStartingGuest(false);
    }
  };

  return (
    <main className="public-page relative flex items-center">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:gap-24 lg:px-12 lg:py-16">
        <section className="hidden self-center lg:block">
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
          <p className="mt-20 max-w-md text-5xl font-semibold leading-[.98] tracking-[-.065em]">
            Tu música, tus momentos,{" "}
            <span className="public-accent">tu colección.</span>
          </p>
          <p className="public-muted mt-6 max-w-sm text-base leading-7">
            Guarda los álbumes que te acompañan y descubre el siguiente con una
            recomendación hecha para ti.
          </p>
        </section>

        <section className="public-card w-full p-6 sm:p-8">
          <Link
            href="/"
            className="flex items-center gap-3 font-semibold tracking-tight lg:hidden"
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
          <div className="mt-8 border-b border-[var(--kanso-line)] pb-6 lg:mt-0">
            <p className="public-accent text-xs font-bold uppercase tracking-[.2em]">
              Tu espacio musical
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.055em]">
              {isRegisterMode ? "Crea tu cuenta" : "Bienvenido de nuevo"}
            </h1>
            <p className="public-muted mt-3 text-sm leading-6">
              {isRegisterMode
                ? "Empieza a construir una colección que se parezca a ti."
                : "Vuelve a tus favoritos y recomendaciones."}
            </p>
          </div>
          {error && (
            <div className="mt-5 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  ¿Cómo te llamas?
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Tu nombre"
                  className="public-input mt-2 px-4 py-3.5"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="public-input mt-2 px-4 py-3.5"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="public-input mt-2 px-4 py-3.5"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="public-button w-full px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Un momento..."
                : isRegisterMode
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--kanso-line)]" />
            <span className="public-muted text-[10px] uppercase tracking-[.18em]">
              o continúa con
            </span>
            <span className="h-px flex-1 bg-[var(--kanso-line)]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="public-button-secondary px-3 py-3 text-sm disabled:opacity-60"
            >
              <span className="public-accent mr-2 font-bold">G</span>
              {isLoggingIn ? "Cargando..." : "Google"}
            </button>
            <button
              onClick={handleAppleLogin}
              className="public-button-secondary px-3 py-3 text-sm"
            >
              <span className="mr-2">●</span>Apple
            </button>
          </div>
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isStartingGuest}
            className="public-button-secondary mt-3 w-full px-3 py-3 text-sm disabled:opacity-60"
          >
            {isStartingGuest
              ? "Preparando tu espacio..."
              : "Probar sin registrarme"}
          </button>
          {guestError && (
            <div
              role="alert"
              className="mt-3 text-sm text-red-600 dark:text-red-300"
            >
              <p>{guestError}</p>
              <Link
                href={`/login?mode=register${nextQuery}`}
                className="mt-1 inline-block font-semibold underline"
              >
                Crear una cuenta
              </Link>
            </div>
          )}
          <p className="public-muted mt-6 text-center text-sm">
            {isRegisterMode ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
            <a
              href={
                isRegisterMode
                  ? `/login?mode=login${nextQuery}`
                  : `/login?mode=register${nextQuery}`
              }
              className="public-accent font-medium hover:underline"
            >
              {isRegisterMode ? "Inicia sesión" : "Regístrate"}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="surface-raised rounded-[var(--radius-md)] px-6 py-4 text-sm text-[var(--kanso-mint)]">
            Cargando...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
