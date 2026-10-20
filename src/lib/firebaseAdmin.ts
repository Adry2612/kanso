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

function parseServiceAccount(
  raw: string,
  source: string,
): ServiceAccount | null {
  try {
    return JSON.parse(raw) as ServiceAccount;
  } catch (error) {
    console.error(`No se pudo parsear la service account (${source}):`, error);
    return null;
  }
}

function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inline) {
    const parsed = parseServiceAccount(inline, "FIREBASE_SERVICE_ACCOUNT");
    if (parsed) return parsed;
  }

  // El JSON en una variable de entorno se rompe con facilidad al pegar (saltos
  // de línea o comillas). En base64 viaja como una sola cadena segura.
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      const decoded = Buffer.from(base64, "base64").toString("utf8");
      const parsed = parseServiceAccount(
        decoded,
        "FIREBASE_SERVICE_ACCOUNT_BASE64",
      );
      if (parsed) return parsed;
    } catch (error) {
      console.error(
        "No se pudo decodificar FIREBASE_SERVICE_ACCOUNT_BASE64:",
        error,
      );
    }
  }

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = parseServiceAccount(raw, "FIREBASE_SERVICE_ACCOUNT_PATH");
      if (parsed) return parsed;
    } catch (error) {
      console.error("No se pudo leer la service account de Firebase:", error);
    }
  }

  return null;
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  );
}

export function getAdminApp(): App {
  if (getApps().length) return getApp();

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error(
      "Falta la service account de Firebase (FIREBASE_SERVICE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT_BASE64 o FIREBASE_SERVICE_ACCOUNT_PATH).",
    );
  }

  return initializeApp({ credential: cert(serviceAccount) });
}

let firestore: Firestore | null = null;

export function adminDb(): Firestore {
  if (!firestore) firestore = getFirestore(getAdminApp());
  return firestore;
}
