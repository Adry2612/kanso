import { randomInt } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import {
  FieldValue,
  type DocumentReference,
  type Firestore,
  type Transaction,
} from "firebase-admin/firestore";
import { adminDb, getAdminApp } from "./firebaseAdmin";
import type {
  FriendPerson,
  FriendProfile,
  FriendSharingSettings,
} from "@/types/friends";

/** Alfabeto base32 sin caracteres que se confunden al dictar un código. */
export const FRIEND_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const FRIEND_CODE_LENGTH = 8;

const FRIEND_CODE_PATTERN = new RegExp(
  `^[${FRIEND_CODE_ALPHABET}]{${FRIEND_CODE_LENGTH}}$`,
);
const UID_PATTERN = /^[A-Za-z0-9]{1,128}$/;

/** Error con un estado HTTP que las rutas pueden devolver sin filtrar detalles. */
export class FriendApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "FriendApiError";
  }
}

/**
 * Normaliza el mapa de compartición.
 *
 * Todo lo que no sea `true` se considera privado: así las cuentas anteriores a
 * esta función siguen sin compartir nada y un valor corrupto nunca expone datos.
 */
export function normalizeSharing(value: unknown): FriendSharingSettings {
  const sharing =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  return {
    recommendations: sharing.recommendations === true,
    collection: sharing.collection === true,
    artists: sharing.artists === true,
  };
}

/** Genera un código nuevo, sin consultar si ya está libre. */
export function generateFriendCode(): string {
  let code = "";
  for (let index = 0; index < FRIEND_CODE_LENGTH; index += 1) {
    code += FRIEND_CODE_ALPHABET[randomInt(0, FRIEND_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Acepta mayúsculas/minúsculas, espacios y guiones al pegar el código.
 * Devuelve `null` si no tiene la forma exacta de un código de Kanso.
 */
export function normalizeFriendCode(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.replace(/[\s-]/g, "").toUpperCase();
  return FRIEND_CODE_PATTERN.test(normalized) ? normalized : null;
}

/** Evita que un UID manipulado altere la ruta de un documento de Firestore. */
export function isValidUid(value: unknown): value is string {
  return typeof value === "string" && UID_PATTERN.test(value);
}

async function pickAvailableFriendCode(
  tx: Transaction,
  db: Firestore,
): Promise<{ code: string; ref: DocumentReference }> {
  // La reserva real la hace el ID del documento: dos transacciones que eligen
  // el mismo código entran en conflicto y la perdedora reintenta con otro.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateFriendCode();
    const ref = db.doc(`friendCodes/${code}`);
    const snapshot = await tx.get(ref);
    if (!snapshot.exists) return { code, ref };
  }

  throw new Error("No se pudo reservar un código de invitación.");
}

async function reserveInTransaction(
  uid: string,
  tx: Transaction,
  db: Firestore,
): Promise<string> {
  const { code, ref } = await pickAvailableFriendCode(tx, db);
  tx.set(ref, {
    uid,
    createdAt: FieldValue.serverTimestamp(),
  });
  return code;
}

/**
 * Reserva un código único en `friendCodes/{code}`.
 *
 * La sobrecarga con transacción permite crear el código y el perfil en la
 * misma operación atómica. La versión sin argumentos es útil para tareas de
 * mantenimiento y para verificar la unicidad de forma aislada.
 */
export async function reserveFriendCode(uid: string): Promise<string>;
export async function reserveFriendCode(
  uid: string,
  tx: Transaction,
  db: Firestore,
): Promise<string>;
export async function reserveFriendCode(
  uid: string,
  tx?: Transaction,
  db?: Firestore,
): Promise<string> {
  if (tx && db) return reserveInTransaction(uid, tx, db);

  const database = adminDb();
  return database.runTransaction((transaction) =>
    reserveInTransaction(uid, transaction, database),
  );
}

function cleanDisplayName(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function cleanPhotoURL(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Devuelve el perfil de una cuenta registrada, creándolo si es la primera vez.
 *
 * El nombre y el avatar se refrescan desde Firebase Auth. El perfil solo guarda
 * datos públicos: nunca el correo ni la colección.
 */
export async function ensureUserProfile(uid: string): Promise<FriendProfile> {
  const authUser = await getAuth(getAdminApp()).getUser(uid);
  const db = adminDb();
  const userRef = db.doc(`users/${uid}`);

  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(userRef);
    const data = snapshot.data() ?? {};
    const displayName =
      cleanDisplayName(authUser.displayName) ||
      cleanDisplayName(data.displayName) ||
      "Coleccionista";

    // Una foto subida desde Ajustes manda sobre la de Google: si el usuario
    // eligió una, no queremos que el siguiente inicio de sesión la borre.
    const storedPhotoURL = cleanPhotoURL(data.photoURL);
    const isCustomPhoto =
      data.photoSource === "custom" ||
      Boolean(storedPhotoURL?.startsWith("/api/avatar/"));
    const customPhotoURL = isCustomPhoto ? storedPhotoURL : null;
    const photoURL =
      customPhotoURL ?? cleanPhotoURL(authUser.photoURL) ?? storedPhotoURL;
    const photoSource = customPhotoURL ? "custom" : photoURL ? "google" : null;

    let friendCode = typeof data.friendCode === "string" ? data.friendCode : "";

    if (!friendCode) {
      friendCode = await reserveFriendCode(uid, tx, db);
    }

    // Se normaliza en cada lectura y se persiste para que el perfil devuelva
    // siempre las tres claves, sin migración ni pérdida de preferencias.
    const sharing = normalizeSharing(data.sharing);

    tx.set(
      userRef,
      {
        displayName,
        photoURL,
        photoSource,
        friendCode,
        sharing,
        ...(snapshot.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { uid, displayName, photoURL, friendCode, sharing };
  });
}

/** Copia mínima y pública de un perfil, para listas y solicitudes. */
export async function getUserSummary(
  uid: string,
): Promise<FriendPerson | null> {
  const snapshot = await adminDb().doc(`users/${uid}`).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() ?? {};
  return {
    uid,
    displayName: cleanDisplayName(data.displayName) || "Coleccionista",
    photoURL: cleanPhotoURL(data.photoURL),
  };
}

export function requestDocumentId(fromUid: string, toUid: string): string {
  return `${fromUid}_${toUid}`;
}

/** Convierte un Timestamp de Firestore en una fecha serializable por JSON. */
export function toIsoDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();

  const timestamp = value as { toDate?: () => Date };
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toISOString();
  }

  return null;
}

/** Campos que se copian en cada lado de una amistad. */
export function friendshipData(person: FriendPerson) {
  return {
    uid: person.uid,
    displayName: person.displayName,
    photoURL: person.photoURL,
    createdAt: FieldValue.serverTimestamp(),
  };
}
