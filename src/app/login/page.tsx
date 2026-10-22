"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, authPersistenceReady } from "../../lib/firebase";
import { signInAsGuest, signInWithGoogle } from "../../lib/firebaseAuth";
import { getAuthErrorMessage } from "@/lib/authErrorMessage";
import { getGuestSignInErrorMessage } from "@/lib/guestSignInError";
import { GoogleIcon } from "@/components/BrandIcons";
import ErrorState from "@/components/ErrorState";

function LoginForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGuest, setIsStartingGuest] = useState(false);
  const oauthTimeoutRef = useRef<number | null>(null);
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
      if (oauthTimeoutRef.current) window.clearTimeout(oauthTimeoutRef.current);
    },
    [],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authPersistenceReady;
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
      // Esperar a que el contexto de autenticación reciba al usuario antes de
      // navegar evita que la pantalla de destino arranque sin sesión.
      await auth.authStateReady();
      router.replace(destination);
    } catch (err: unknown) {
      setError(
        getAuthErrorMessage(
          err,
          "No hemos podido completar la operación. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;

    setError(null);
    setIsLoggingIn(true);
    // Red de seguridad: si el popup nunca resuelve, se libera el botón.
    oauthTimeoutRef.current = window.setTimeout(() => {
      setIsLoggingIn(false);
    }, 90_000);

    try {
      const user = await signInWithGoogle();
      if (user) router.replace(destination);
    } catch (err: unknown) {
      setError(
        getAuthErrorMessage(err, "No hemos podido iniciar sesión con Google."),
      );
    } finally {
      if (oauthTimeoutRef.current) {
        window.clearTimeout(oauthTimeoutRef.current);
        oauthTimeoutRef.current = null;
      }
      setIsLoggingIn(false);
    }
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
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_420px] lg:gap-24 lg:px-12 lg:py-16">
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
            <ErrorState
              variant="inline"
              className="mt-5"
              title="No pudimos completar la operación"
              description={error}
            />
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
                autoComplete="email"
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
                autoComplete={
                  isRegisterMode ? "new-password" : "current-password"
                }
                minLength={6}
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
          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={isLoggingIn}
            aria-busy={isLoggingIn}
            className="public-button-secondary inline-flex w-full items-center justify-center gap-2 px-3 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon className="h-[18px] w-[18px] shrink-0" />
            {isLoggingIn ? "Cargando..." : "Google"}
          </button>
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
            <ErrorState
              variant="inline"
              className="mt-3"
              title="No pudimos preparar tu sesión de prueba"
              description={guestError}
              action={
                <Link
                  href={`/login?mode=register${nextQuery}`}
                  className="text-xs font-semibold text-[var(--kanso-mint)] underline-offset-2 hover:underline"
                >
                  Crear una cuenta
                </Link>
              }
            />
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
