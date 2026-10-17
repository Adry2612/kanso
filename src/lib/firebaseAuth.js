import { auth, db } from "./firebase";
import {
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();
let isSigningIn = false;

export async function signInAsGuest() {
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
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await saveUserToFirestore(user);

    return user;
  } catch (error) {
    // Ignorar error si el usuario cancela el popup
    if (
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      console.log("Popup de autenticación cancelado por el usuario");
      return null;
    }
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function saveUserToFirestore(user) {
  if (!user?.uid) return;

  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    // Guardar solo si no existe
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: new Date(),
    });
  }
}
