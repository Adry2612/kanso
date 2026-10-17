import { readFileSync } from "node:fs";
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Módulo solo de servidor: nunca debe importarse desde un componente cliente.

function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  try {
    if (inline) return JSON.parse(inline) as ServiceAccount;
    if (path) return JSON.parse(readFileSync(path, "utf8")) as ServiceAccount;
  } catch (error) {
    console.error("No se pudo leer la service account de Firebase:", error);
  }

  return null;
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  );
}

export function getAdminApp(): App {
  if (getApps().length) return getApp();

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Falta la service account de Firebase (FIREBASE_SERVICE_ACCOUNT o FIREBASE_SERVICE_ACCOUNT_PATH).",
    );
  }

  return initializeApp({ credential: cert(serviceAccount) });
}

let firestore: Firestore | null = null;

export function adminDb(): Firestore {
  if (!firestore) firestore = getFirestore(getAdminApp());
  return firestore;
}
