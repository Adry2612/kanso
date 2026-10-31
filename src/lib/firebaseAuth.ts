import { auth, authPersistenceReady } from "./firebase";
import { markGuestEntry } from "./guestSession";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const MOBILE_QUERY = "(max-width: 1023px)";

let isSigningIn = false;
let redirectResultPromise: Promise<User | null> | null = null;

const POPUP_CANCELLED_CODES = new Set([
  "auth/cancelled-popup-request",
  "auth/popup-closed-by-user",
  "auth/redirect-cancelled-by-user",
  "auth/user-cancelled",
]);

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object"
    ? (error as { code?: string }).code
    : undefined;
}

function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );
}

export async function signInAsGuest(): Promise<User> {
  await authPersistenceReady;
  await auth.authStateReady();
  if (auth.currentUser) {
    markGuestEntry();
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  markGuestEntry();
  return result.user;
}

async function signInWithProvider(
  provider: GoogleAuthProvider,
  providerName: string,
): Promise<User | null> {
  if (isSigningIn) {
    console.warn("Ya hay un proceso de inicio de sesión en curso");
    return null;
  }

  try {
    isSigningIn = true;
    await authPersistenceReady;
    const result = await signInWithPopup(auth, provider);
    await auth.authStateReady();

    // El perfil no se escribe desde el cliente: Firestore deniega el acceso
    // directo y el documento users/{uid} no tiene consumidores.
    return result.user;
  } catch (error: unknown) {
    if (POPUP_CANCELLED_CODES.has(errorCode(error) ?? "")) {
      return null;
    }
    console.error(`Error al iniciar sesión con ${providerName}:`, error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  if (isSigningIn) {
    console.warn("Ya hay un proceso de inicio de sesión en curso");
    return null;
  }

  // En móvil la ventana emergente se bloquea o se cierra sola: la redirección
  // abre el selector de cuenta del navegador y vuelve a esta misma pantalla.
  if (isMobileViewport()) {
    try {
      isSigningIn = true;
      await authPersistenceReady;
      await signInWithRedirect(auth, googleProvider);
      return null;
    } finally {
      isSigningIn = false;
    }
  }

  return signInWithProvider(googleProvider, "Google");
}

/**
 * Consume el resultado de una redirección de Google. Se memoriza para que los
 * dobles montajes de React no llamen dos veces a `getRedirectResult`.
 */
export function consumeGoogleRedirectResult(): Promise<User | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      await authPersistenceReady;
      try {
        const result = await getRedirectResult(auth);
        if (!result) return null;
        await auth.authStateReady();
        return result.user;
      } catch (error: unknown) {
        if (POPUP_CANCELLED_CODES.has(errorCode(error) ?? "")) return null;
        console.error("Error al completar el acceso con Google:", error);
        throw error;
      }
    })();
  }

  return redirectResultPromise;
}
