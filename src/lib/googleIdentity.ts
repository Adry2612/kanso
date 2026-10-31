"use client";

/**
 * Carga y uso de Google Identity Services (GIS).
 *
 * A diferencia del popup de Firebase, GIS habla directamente con Google desde
 * el origen de la app y devuelve un access token. Con ese token se crea una
 * credencial de Firebase y se evita la ventana intermedia de `authDomain`, que
 * Safari aísla y termina perdiendo el estado de la redirección.
 */

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
  "707488772865-snhjpgbfgros6s2so1kl2b5dbinklbbm.apps.googleusercontent.com";

const SCRIPT_ID = "google-identity-services";
const GIS_SRC = "https://accounts.google.com/gsi/client";

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type TokenError = { type?: string };

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

type GoogleAccounts = {
  oauth2?: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      error_callback?: (error: TokenError) => void;
    }) => TokenClient;
  };
};

declare global {
  interface Window {
    google?: { accounts?: GoogleAccounts };
  }
}

let loadPromise: Promise<void> | null = null;

/** Precarga el script para que el popup se abra dentro del gesto del usuario. */
export function loadGoogleIdentity(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Google Identity Services")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar Google Identity Services"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

function tokenError(code: string, description?: string): Error {
  return Object.assign(new Error(description || code), { code });
}

/**
 * Abre el selector de cuenta de Google y devuelve un access token.
 *
 * Debe llamarse desde un manejador de clic. El script se precarga en la
 * pantalla de login para no perder la activación del usuario.
 */
export async function requestGoogleAccessToken(): Promise<string> {
  await loadGoogleIdentity();

  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      reject(tokenError("google_identity_unavailable"));
      return;
    }

    try {
      const client = oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: (response) => {
          if (response.error) {
            reject(tokenError(response.error, response.error_description));
            return;
          }
          if (response.access_token) {
            resolve(response.access_token);
            return;
          }
          reject(tokenError("google_token_missing"));
        },
        error_callback: (error) => {
          reject(tokenError(error.type ?? "google_token_error"));
        },
      });

      client.requestAccessToken({ prompt: "select_account" });
    } catch (error) {
      reject(
        error instanceof Error ? error : tokenError("google_identity_error"),
      );
    }
  });
}
