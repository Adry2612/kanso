import { auth, authPersistenceReady } from "./firebase";
import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";

const provider = new GoogleAuthProvider();
let isSigningIn = false;

export async function signInAsGuest() {
  await authPersistenceReady;
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser;

  const result = await signInAnonymously(auth);
  return result.user;
}

export async function signInWithGoogle() {
  // Prevenir múltiples popups simultáneos
  if (isSigningIn) {
    console.warn("Ya hay un proceso de inicio de sesión en curso");
    return null;
  }

  try {
    isSigningIn = true;
    await authPersistenceReady;
    const result = await signInWithPopup(auth, provider);

    // El perfil no se escribe desde el cliente: las reglas de Firestore deniegan
    // todo acceso directo y el documento users/{uid} no tiene consumidores.
    return result.user;
  } catch (error) {
    // Ignorar error si el usuario cancela el popup
    if (
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      console.log("Popup de autenticación cancelado por el usuario");
      return null;
    }
    // El popup no llegó a abrirse (bloqueado o cerrado por el navegador): la
    // sesión no cambia, así que se trata como cancelación y no como error.
    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/web-storage-unsupported"
    ) {
      console.warn("El popup de Google no pudo abrirse:", error.code);
      return null;
    }
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}
