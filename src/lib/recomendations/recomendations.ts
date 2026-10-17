/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

export async function albumRecomendation(user: any) {
  if (!user?.uid) return;

  const albumDoc = await query(
    collection(db, "favorite_albums"),
    where("userId", "==", user.uid),
  );

  const albums = await getDocs(albumDoc);

  if (albums.empty) return;

  const randomAlbum = Math.floor(Math.random() * albums.docs.length);

  return albums.docs[randomAlbum].data() as any;
}
