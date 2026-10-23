import { auth, authPersistenceReady } from "./firebase";
import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  type User,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

let isSigningIn = false;

const POPUP_CANCELLED_CODES = new Set([
  "auth/cancelled-popup-request",
  "auth/popup-closed-by-user",
]);

function errorCode(error: unknown): string | undefined {
  return error && typeof error === "object"
    ? (error as { code?: string }).code
    : undefined;
}

export async function signInAsGuest(): Promise<User> {
  await authPersistenceReady;
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;

  const result = await signInAnonymously(auth);
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
  return signInWithProvider(googleProvider, "Google");
}
