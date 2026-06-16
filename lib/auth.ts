import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

/** Trigger the Google sign-in popup. Returns the signed-in user. */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** Sign the current user out. */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes. Returns the unsubscribe function.
 * `user` is null when signed out.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { User };
