import "server-only";

import type {
  CollectionReference,
  Firestore,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

/** Subcolección vigente de la colección personal. */
export const COLLECTION_SUBCOLLECTION = "collection";

/** Subcolección heredada, anterior al renombrado. */
export const LEGACY_COLLECTION_SUBCOLLECTION = "favorites";

export function collectionRef(db: Firestore, uid: string): CollectionReference {
  return db.collection(`users/${uid}/${COLLECTION_SUBCOLLECTION}`);
}

export function legacyCollectionRef(
  db: Firestore,
  uid: string,
): CollectionReference {
  return db.collection(`users/${uid}/${LEGACY_COLLECTION_SUBCOLLECTION}`);
}

export function isLegacyCollectionRef(
  reference: { parent: { path: string } },
  uid: string,
): boolean {
  return (
    reference.parent.path === `users/${uid}/${LEGACY_COLLECTION_SUBCOLLECTION}`
  );
}

/**
 * Documentos de la colección combinando la ruta nueva y la heredada.
 *
 * La ruta nueva gana si el mismo documento existe en ambas, de modo que una
 * migración parcial nunca hace reaparecer datos antiguos.
 */
export async function listMergedCollectionDocs(
  db: Firestore,
  uid: string,
): Promise<QueryDocumentSnapshot[]> {
  const [current, legacy] = await Promise.all([
    collectionRef(db, uid).get(),
    legacyCollectionRef(db, uid).get(),
  ]);

  const merged = new Map<string, QueryDocumentSnapshot>();
  legacy.docs.forEach((document) => merged.set(document.id, document));
  current.docs.forEach((document) => merged.set(document.id, document));

  return Array.from(merged.values());
}
