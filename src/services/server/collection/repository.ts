import "server-only";

import {
  FieldValue,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import type { Album } from "@/types/album";
import type { FavoriteFormat, FavoriteTag } from "@/types/favorites";

/** Datos que se escriben en `users/{uid}/favorites`. */
export type FavoriteWrite = {
  labeledFeelings: string[];
  activities: string[];
  format: FavoriteFormat[];
  tags: FavoriteTag[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

/**
 * Acceso a Firestore de colección y pendientes.
 *
 * Toda la persistencia (lotes, referencias y consultas) vive aquí; el servicio
 * solo decide qué escribir y qué devolver.
 */
export function createCollectionRepository(db: Firestore = adminDb()) {
  const albums = () => db.collection("albums");
  const favorites = (uid: string) => db.collection(`users/${uid}/favorites`);
  const pending = (uid: string) => db.collection(`users/${uid}/listenLater`);

  return {
    async findAlbumId(spotifyId: string): Promise<string | null> {
      const snapshot = await albums().where("id", "==", spotifyId).get();
      return snapshot.empty ? null : snapshot.docs[0].id;
    },

    async createAlbum(album: Album): Promise<string> {
      const reference = await albums().add(album);
      return reference.id;
    },

    async getAlbum(
      albumDocId: string,
    ): Promise<Record<string, unknown> | null> {
      const snapshot = await db.doc(`albums/${albumDocId}`).get();
      return snapshot.exists ? (snapshot.data() ?? null) : null;
    },

    async listFavoriteRefs(
      uid: string,
      albumDocId: string,
    ): Promise<DocumentReference[]> {
      const snapshot = await favorites(uid)
        .where("albumId", "==", albumDocId)
        .get();
      return snapshot.docs.map((document) => document.ref);
    },

    async listFavorites(uid: string): Promise<QueryDocumentSnapshot[]> {
      const snapshot = await favorites(uid).get();
      return snapshot.docs;
    },

    async listFavoriteAlbumIds(uid: string): Promise<Set<string>> {
      const snapshot = await favorites(uid).get();
      return new Set(
        snapshot.docs
          .map((document) => document.data().albumId)
          .filter(isNonEmptyString),
      );
    },

    pendingRef(uid: string, albumDocId: string): DocumentReference {
      return pending(uid).doc(albumDocId);
    },

    async getPending(
      uid: string,
      albumDocId: string,
    ): Promise<DocumentSnapshot> {
      return pending(uid).doc(albumDocId).get();
    },

    async listPending(uid: string): Promise<QueryDocumentSnapshot[]> {
      const snapshot = await pending(uid).orderBy("addedAt", "desc").get();
      return snapshot.docs;
    },

    async findPendingRefs(
      uid: string,
      albumDocId: string,
    ): Promise<DocumentReference[]> {
      const snapshot = await pending(uid)
        .where("albumId", "==", albumDocId)
        .get();
      return snapshot.docs.map((document) => document.ref);
    },

    /**
     * Guarda o actualiza el favorito y descarta el pendiente del mismo álbum
     * en un solo lote: colección y pendientes son mutuamente excluyentes.
     */
    async saveFavorite(
      uid: string,
      albumDocId: string,
      write: FavoriteWrite,
      existingRef: DocumentReference | null,
    ): Promise<void> {
      const batch = db.batch();

      if (existingRef) {
        batch.set(
          existingRef,
          {
            ...write,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        batch.set(favorites(uid).doc(albumDocId), {
          albumId: albumDocId,
          ...write,
          addedAt: FieldValue.serverTimestamp(),
        });
      }

      batch.delete(pending(uid).doc(albumDocId));
      await batch.commit();
    },

    async deleteRefs(refs: DocumentReference[]): Promise<void> {
      await Promise.all(refs.map((reference) => reference.delete()));
    },

    async setPending(uid: string, albumDocId: string): Promise<void> {
      await pending(uid).doc(albumDocId).set({
        albumId: albumDocId,
        addedAt: FieldValue.serverTimestamp(),
      });
    },

    /** Feed global y anónimo de últimos álbumes añadidos por la comunidad. */
    async touchCommunityAlbum(albumDocId: string): Promise<void> {
      await db
        .doc(`communityAlbums/${albumDocId}`)
        .set(
          { albumId: albumDocId, addedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
    },
  };
}

export type CollectionRepository = ReturnType<
  typeof createCollectionRepository
>;
