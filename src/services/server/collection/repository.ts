import "server-only";

import {
  FieldValue,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  collectionRef,
  isLegacyCollectionRef,
  legacyCollectionRef,
  listMergedCollectionDocs,
} from "./legacy";
import type { Album } from "@/types/album";
import type { CollectionFormat, CollectionTag } from "@/types/collection";

/** Datos que se escriben en `users/{uid}/collection`. */
export type CollectionWrite = {
  labeledFeelings: string[];
  activities: string[];
  format: CollectionFormat[];
  tags: CollectionTag[];
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

    async listCollectionRefs(
      uid: string,
      albumDocId: string,
    ): Promise<DocumentReference[]> {
      const [current, legacy] = await Promise.all([
        collectionRef(db, uid).where("albumId", "==", albumDocId).get(),
        legacyCollectionRef(db, uid).where("albumId", "==", albumDocId).get(),
      ]);

      return [...current.docs, ...legacy.docs].map((document) => document.ref);
    },

    async listCollection(uid: string): Promise<QueryDocumentSnapshot[]> {
      return listMergedCollectionDocs(db, uid);
    },

    async listCollectionAlbumIds(uid: string): Promise<Set<string>> {
      const docs = await listMergedCollectionDocs(db, uid);
      return new Set(
        docs
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
     * Guarda o actualiza una entrada de la colección y descarta el pendiente
     * del mismo álbum en un solo lote: colección y pendientes son mutuamente
     * excluyentes. Las escrituras van siempre a la ruta vigente y limpian las
     * copias heredadas.
     */
    async saveCollectionEntry(
      uid: string,
      albumDocId: string,
      write: CollectionWrite,
    ): Promise<boolean> {
      const refs = await this.listCollectionRefs(uid, albumDocId);
      const currentRef = refs.find(
        (reference) => !isLegacyCollectionRef(reference, uid),
      );
      const legacyRefs = refs.filter((reference) =>
        isLegacyCollectionRef(reference, uid),
      );

      const batch = db.batch();

      if (currentRef) {
        batch.set(
          currentRef,
          {
            ...write,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        batch.set(collectionRef(db, uid).doc(albumDocId), {
          albumId: albumDocId,
          ...write,
          addedAt: FieldValue.serverTimestamp(),
        });
      }

      legacyRefs.forEach((reference) => batch.delete(reference));
      batch.delete(pending(uid).doc(albumDocId));
      await batch.commit();

      return Boolean(currentRef || legacyRefs.length > 0);
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
