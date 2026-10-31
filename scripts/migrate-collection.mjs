#!/usr/bin/env node

/**
 * Migra las colecciones personales de `users/{uid}/favorites` a
 * `users/{uid}/collection`.
 *
 * Uso:
 *   node scripts/migrate-collection.mjs --dry-run
 *   node scripts/migrate-collection.mjs
 *   node scripts/migrate-collection.mjs --delete-source
 *   node scripts/migrate-collection.mjs --user <uid>
 *
 * Es idempotente: si el destino ya existe no lo sobrescribe, lo cuenta como
 * conflicto y nunca borra el origen en ese caso.
 */

import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const BATCH_SIZE = 400;

function loadEnvFile() {
  try {
    const raw = readFileSync(".env", "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // Sin .env: se usan las variables de entorno del proceso.
  }
}

function parseArgs(argv) {
  const options = { dryRun: false, deleteSource: false, user: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--delete-source") options.deleteSource = true;
    else if (arg === "--user") options.user = argv[++index] ?? null;
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Uso: node scripts/migrate-collection.mjs [--dry-run] [--delete-source] [--user <uid>]",
      );
      process.exit(0);
    } else {
      throw new Error(`Argumento desconocido: ${arg}`);
    }
  }

  return options;
}

function loadCredential() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (inline) return cert(JSON.parse(inline));
  if (base64) {
    return cert(JSON.parse(Buffer.from(base64, "base64").toString("utf8")));
  }
  if (path) {
    return cert(JSON.parse(readFileSync(path, "utf8")));
  }

  throw new Error(
    "Falta la service account: define FIREBASE_SERVICE_ACCOUNT_PATH en .env o en el entorno.",
  );
}

function userFromDocument(document) {
  const favoritesRef = document.ref.parent;
  const userRef = favoritesRef.parent;
  const usersRef = userRef?.parent;

  if (!userRef || usersRef?.id !== "users") {
    return null;
  }

  return userRef.id;
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));

  initializeApp({ credential: loadCredential() });
  const db = getFirestore();

  console.log(
    `Migrando users/{uid}/favorites -> users/{uid}/collection${
      options.dryRun ? " (dry-run)" : ""
    }${options.deleteSource ? " + borrado del origen" : ""}`,
  );

  const snapshot = await db.collectionGroup("favorites").get();
  const documents = snapshot.docs.filter((document) => {
    const uid = userFromDocument(document);
    if (!uid) {
      console.warn(`Omitido documento fuera de users/*: ${document.ref.path}`);
      return false;
    }
    return !options.user || uid === options.user;
  });

  const summary = {
    users: new Set(),
    copied: 0,
    conflicts: 0,
    skipped: 0,
    deleted: 0,
    errors: 0,
  };

  let batch = db.batch();
  let pendingWrites = 0;

  const flush = async () => {
    if (pendingWrites === 0) return;
    if (!options.dryRun) await batch.commit();
    batch = db.batch();
    pendingWrites = 0;
  };

  for (const document of documents) {
    const uid = userFromDocument(document);
    if (!uid) continue;

    summary.users.add(uid);
    const destination = db.doc(`users/${uid}/collection/${document.id}`);

    try {
      const existing = await destination.get();
      if (existing.exists) {
        summary.conflicts += 1;
        console.warn(`Conflicto, se conserva el destino: ${destination.path}`);
        continue;
      }

      const data = document.data();
      const payload = {
        ...data,
        albumId:
          typeof data.albumId === "string" && data.albumId
            ? data.albumId
            : document.id,
      };

      if (data.addedAt === undefined) {
        payload.addedAt = FieldValue.serverTimestamp();
      }

      if (!options.dryRun) {
        batch.set(destination, payload);
        if (options.deleteSource) {
          batch.delete(document.ref);
        }
        pendingWrites += 1;
        if (pendingWrites >= BATCH_SIZE) await flush();
      }

      summary.copied += 1;
      if (options.deleteSource && !options.dryRun) summary.deleted += 1;
    } catch (error) {
      summary.errors += 1;
      console.error(`Error en ${document.ref.path}:`, error);
    }
  }

  await flush();

  console.log("\nResumen:");
  console.log(`  Usuarios afectados: ${summary.users.size}`);
  console.log(`  Copiados: ${summary.copied}`);
  console.log(`  Conflictos (destino existente): ${summary.conflicts}`);
  console.log(`  Omitidos: ${summary.skipped}`);
  console.log(
    `  Orígenes ${options.deleteSource ? "borrados" : "conservados"}: ${summary.deleted}`,
  );
  console.log(`  Errores: ${summary.errors}`);

  if (options.dryRun) {
    console.log("\nDry-run: no se ha escrito ni borrado nada.");
  }
  if (summary.conflicts > 0) {
    console.log(
      "\nRevisa los conflictos manualmente: no se ha sobrescrito ningún destino ni borrado su origen.",
    );
  }

  if (summary.errors > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
