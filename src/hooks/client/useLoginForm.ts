import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuthErrorMessage } from "@/lib/authErrorMessage";
import { getGuestSignInErrorMessage } from "@/lib/guestSignInError";
import { loadGoogleIdentity } from "@/lib/googleIdentity";
import {
  completeEmailSignInLink,
  consumeGoogleRedirectResult,
  isEmailSignInLinkUrl,
  loginWithEmail,
  registerWithEmail,
  sendEmailSignInLink,
  signInAsGuest,
  signInWithGoogle,
  storedEmailForSignIn,
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
  const [isSendingEmailLink, setIsSendingEmailLink] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailLinkHref, setEmailLinkHref] = useState<string | null>(null);
  const oauthTimeoutRef = useRef<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisterMode = searchParams.get("mode") === "register";
  const requestedNext = searchParams.get("next");
  const destination =
    requestedNext &&
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/home";
  const nextQuery =
    destination !== "/home" ? `&next=${encodeURIComponent(destination)}` : "";

  // El script de Google Identity Services se precarga para que el popup se
  // abra dentro del gesto de la persona y no lo bloquee el navegador.
  useEffect(() => {
    void loadGoogleIdentity();
  }, []);

  // Al volver de la redirección de Google, Firebase deja el resultado en esta
  // pantalla. Si no hay cuenta elegida, no se crea ninguna sesión.
  useEffect(() => {
    let cancelled = false;

    consumeGoogleRedirectResult()
      .then((user) => {
        if (!cancelled && user) router.replace(destination);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            getAuthErrorMessage(
              err,
              "No hemos podido iniciar sesión con Google.",
            ),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [destination, router]);

  // Si la página se abre desde un enlace de acceso, se completa aquí. Si el
  // correo no está guardado (otro dispositivo o navegador), se pide en el
  // formulario antes de canjear el código.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const href = window.location.href;
    if (!isEmailSignInLinkUrl(href)) return;

    setEmailLinkHref(href);
    const storedEmail = storedEmailForSignIn();
    if (!storedEmail) return;

    let cancelled = false;
    completeEmailSignInLink(storedEmail, href)
      .then((user) => {
        if (!cancelled && user) router.replace(destination);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            getAuthErrorMessage(
              err,
              "No hemos podido completar el acceso con el enlace.",
            ),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [destination, router]);

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

    if (emailLinkHref) {
      try {
        await completeEmailSignInLink(email.trim(), emailLinkHref);
        router.replace(destination);
      } catch (err: unknown) {
        setError(
          getAuthErrorMessage(
            err,
            "No hemos podido completar el acceso con el enlace.",
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

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

  const handleSendEmailLink = async () => {
    if (isSendingEmailLink) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Escribe tu correo para recibir el enlace de acceso.");
      return;
    }

    setError(null);
    setEmailLinkSent(false);
    setIsSendingEmailLink(true);

    try {
      await sendEmailSignInLink(trimmedEmail);
      setEmailLinkSent(true);
    } catch (err: unknown) {
      setError(
        getAuthErrorMessage(err, "No hemos podido enviar el enlace de acceso."),
      );
    } finally {
      setIsSendingEmailLink(false);
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
    isSendingEmailLink,
    emailLinkSent,
    emailLinkHref,
    isRegisterMode,
    nextQuery,
    handleSubmit,
    handleGoogleLogin,
    handleSendEmailLink,
    handleGuestLogin,
  };
}
