import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, authPersistenceReady } from "@/lib/firebase";
import { signInAsGuest, signInWithGoogle } from "@/lib/firebaseAuth";

async function waitForAuthState() {
  await authPersistenceReady;
  await auth.authStateReady();
}

export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string,
): Promise<User> {
  await waitForAuthState();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  await updateProfile(credential.user, { displayName });
  await auth.authStateReady();
  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  await waitForAuthState();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await auth.authStateReady();
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export { signInAsGuest, signInWithGoogle };
