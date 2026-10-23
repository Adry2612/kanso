import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthErrorMessage } from "@/lib/authErrorMessage";
import { getGuestSignInErrorMessage } from "@/lib/guestSignInError";
import {
  loginWithEmail,
  registerWithEmail,
  signInAsGuest,
  signInWithGoogle,
} from "@/services/client/auth";

export function useLoginForm() {
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

  useEffect(
    () => () => {
      if (oauthTimeoutRef.current) window.clearTimeout(oauthTimeoutRef.current);
    },
    [],
  );

  const handleSubmit = async (event: FormEvent) => {
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
        await registerWithEmail(displayName, email, password);
      } else {
        await loginWithEmail(email, password);
      }
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

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    guestError,
    isLoggingIn,
    isSubmitting,
    isStartingGuest,
    isRegisterMode,
    nextQuery,
    handleSubmit,
    handleGoogleLogin,
    handleGuestLogin,
  };
}
