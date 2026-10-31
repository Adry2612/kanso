import { auth, authPersistenceReady } from "./firebase";
import { requestGoogleAccessToken } from "./googleIdentity";
import { clearGuestEntry, markGuestEntry } from "./guestSession";
import {
  GoogleAuthProvider,
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInAnonymously,
  signInWithCredential,
  signInWithEmailLink,
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

/** Códigos en los que merece la pena reintentar con otro flujo. */
const POPUP_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
  "auth/web-storage-unsupported",
]);

/** Errores de configuración de Google Identity Services. */
const GOOGLE_IDENTITY_CONFIG_CODES = new Set([
  "origin_mismatch",
  "invalid_client",
  "idpiframe_initialization_failed",
  "google_identity_unavailable",
  "google_token_missing",
  "google_identity_error",
]);

const GOOGLE_IDENTITY_CANCELLED_CODES = new Set([
  "popup_closed",
  "access_denied",
  "google_redirect_cancelled",
]);

const GOOGLE_REDIRECT_FLAG = "kanso:google-redirect";
const EMAIL_SIGN_IN_KEY = "kanso:email-for-sign-in";

/** Marca que salimos a Google con redirección para detectar vueltas vacías. */
function markGoogleRedirect(): void {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_FLAG, "1");
  } catch {
    // Sin sessionStorage el flujo funciona igual; solo perdemos el aviso.
  }
}

/** Devuelve si había una redirección pendiente y limpia la marca. */
function consumeGoogleRedirectFlag(): boolean {
  try {
    const pending = sessionStorage.getItem(GOOGLE_REDIRECT_FLAG) === "1";
    sessionStorage.removeItem(GOOGLE_REDIRECT_FLAG);
    return pending;
  } catch {
    return false;
  }
}

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

/**
 * Safari bloquea o aísla la ventana emergente de Firebase con su protección
 * contra el seguimiento, así que usa la redirección completa, que no depende
 * de la comunicación entre la pestaña y el popup.
 */
function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent;
  return (
    /Safari/i.test(userAgent) &&
    !/Chrome|Chromium|CriOS|Android|Edg|OPR|Firefox/i.test(userAgent)
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

/**
 * Inicia sesión con un access token de Google Identity Services.
 *
 * Evita por completo el popup y la redirección de `authDomain`: Google habla
 * con la app y el token se canjea por una credencial de Firebase.
 */
async function signInWithGoogleIdentity(): Promise<User | null> {
  try {
    const accessToken = await requestGoogleAccessToken();
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const result = await signInWithCredential(auth, credential);
    clearGuestEntry();
    return result.user;
  } catch (error: unknown) {
    const code = errorCode(error) ?? "";

    if (
      GOOGLE_IDENTITY_CANCELLED_CODES.has(code) ||
      POPUP_CANCELLED_CODES.has(code)
    ) {
      return null;
    }

    console.error(
      "Error al iniciar sesión con Google Identity Services:",
      error,
    );
    throw error;
  }
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

    // El perfil no se escribe desde el cliente: Firestore deniega el acceso
    // directo y el documento users/{uid} no tiene consumidores.
    return result.user;
  } catch (error: unknown) {
    const code = errorCode(error) ?? "";

    if (POPUP_FALLBACK_CODES.has(code)) {
      // El popup de Firebase no es viable: se intenta Google Identity
      // Services y, solo si tampoco está disponible, la redirección.
      try {
        return await signInWithGoogleIdentity();
      } catch (identityError: unknown) {
        if (GOOGLE_IDENTITY_CONFIG_CODES.has(errorCode(identityError) ?? "")) {
          throw identityError;
        }
        markGoogleRedirect();
        await signInWithRedirect(auth, provider);
        return null;
      }
    }

    if (POPUP_CANCELLED_CODES.has(code)) {
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

  // En móvil y en Safari el popup y la redirección de Firebase quedan
  // aislados por el navegador. Google Identity Services devuelve el token
  // directamente y evita depender de cookies de terceros.
  if (isMobileViewport() || isSafari()) {
    try {
      isSigningIn = true;
      await authPersistenceReady;
      return await signInWithGoogleIdentity();
    } finally {
      isSigningIn = false;
    }
  }

  return signInWithProvider(googleProvider, "Google");
}

/**
 * Envía un enlace de acceso al correo indicado.
 *
 * Es la vía alternativa cuando el navegador bloquea el popup o la redirección
 * de Google (Safari, modo privado, apps instaladas). El enlace vuelve a
 * `/login` y se completa en el mismo navegador.
 */
export async function sendEmailSignInLink(email: string): Promise<void> {
  await authPersistenceReady;
  await sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}/login?mode=login`,
    handleCodeInApp: true,
  });

  try {
    window.localStorage.setItem(EMAIL_SIGN_IN_KEY, email);
  } catch {
    // Sin localStorage el enlace se completa pidiendo el correo de nuevo.
  }
}

/** Indica si la URL actual es un enlace de acceso de Firebase. */
export function isEmailSignInLinkUrl(href: string): boolean {
  return isSignInWithEmailLink(auth, href);
}

/** Correo guardado al pedir el enlace, si sigue disponible. */
export function storedEmailForSignIn(): string | null {
  try {
    return window.localStorage.getItem(EMAIL_SIGN_IN_KEY);
  } catch {
    return null;
  }
}

/** Completa el acceso con el enlace y el correo que lo pidió. */
export async function completeEmailSignInLink(
  email: string,
  href: string,
): Promise<User> {
  await authPersistenceReady;
  const credential = await signInWithEmailLink(auth, email, href);
  clearGuestEntry();

  try {
    window.localStorage.removeItem(EMAIL_SIGN_IN_KEY);
  } catch {
    // La limpieza es opcional.
  }

  return credential.user;
}

/**
 * Consume el resultado de una redirección de Google. Se memoriza para que los
 * dobles montajes de React no llamen dos veces a `getRedirectResult`.
 */
export function consumeGoogleRedirectResult(): Promise<User | null> {
  if (!redirectResultPromise) {
    redirectResultPromise = (async () => {
      await authPersistenceReady;
      const hadPendingRedirect = consumeGoogleRedirectFlag();
      try {
        const result = await getRedirectResult(auth);
        if (!result) {
          if (hadPendingRedirect) {
            throw Object.assign(
              new Error("No se completó el acceso con Google."),
              { code: "auth/redirect-missing" },
            );
          }
          return null;
        }
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
