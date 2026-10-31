import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, authPersistenceReady } from "@/lib/firebase";
import { clearGuestEntry } from "@/lib/guestSession";
import {
  completeEmailSignInLink,
  consumeGoogleRedirectResult,
  isEmailSignInLinkUrl,
  sendEmailSignInLink,
  signInAsGuest,
  signInWithGoogle,
  storedEmailForSignIn,
} from "@/lib/firebaseAuth";

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
  clearGuestEntry();
  await auth.authStateReady();
  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  await waitForAuthState();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  clearGuestEntry();
  await auth.authStateReady();
  return credential.user;
}

export async function signOutUser(): Promise<void> {
  clearGuestEntry();
  await signOut(auth);
}

export {
  completeEmailSignInLink,
  consumeGoogleRedirectResult,
  isEmailSignInLinkUrl,
  sendEmailSignInLink,
  signInAsGuest,
  signInWithGoogle,
  storedEmailForSignIn,
};
