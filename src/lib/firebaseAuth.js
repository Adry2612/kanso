import { auth, authPersistenceReady } from "./firebase";
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();
// Apple necesita un Service ID, Team ID, Key ID y la clave .p8 configurados
// en Firebase Authentication. Sin esas credenciales Firebase devuelve
// auth/operation-not-allowed antes de abrir el popup.
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

let isSigningIn = false;

const POPUP_CANCELLED_CODES = new Set([
  "auth/cancelled-popup-request",
  "auth/popup-closed-by-user",
]);

export async function signInAsGuest() {
  await authPersistenceReady;
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;

  const result = await signInAnonymously(auth);
  return result.user;
}

async function signInWithProvider(provider, providerName) {
  // Prevenir múltiples popups simultáneos
  if (isSigningIn) {
    console.warn("Ya hay un proceso de inicio de sesión en curso");
    return null;
  }

  try {
    isSigningIn = true;
    await authPersistenceReady;
    const result = await signInWithPopup(auth, provider);
    await auth.authStateReady();

    // El perfil no se escribe desde el cliente: las reglas de Firestore deniegan
    // todo acceso directo y el documento users/{uid} no tiene consumidores.
    return result.user;
  } catch (error) {
    // Ignorar error si el usuario cancela el popup.
    if (POPUP_CANCELLED_CODES.has(error.code)) {
      console.log(`Popup de autenticación con ${providerName} cancelado`);
      return null;
    }
    console.error(`Error al iniciar sesión con ${providerName}:`, error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function signInWithGoogle() {
  return signInWithProvider(googleProvider, "Google");
}

export async function signInWithApple() {
  return signInWithProvider(appleProvider, "Apple");
}
