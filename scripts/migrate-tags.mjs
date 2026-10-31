#!/usr/bin/env node

/**
 * Migra las etiquetas de idioma y género de las colecciones a sus claves
 * canónicas.
 *
 * Uso:
 *   node scripts/migrate-tags.mjs --dry-run
 *   node scripts/migrate-tags.mjs
 *   node scripts/migrate-tags.mjs --user <uid>
 *
 * Es idempotente: un segundo pase no encuentra cambios. Los valores que no
 * reconoce no se borran: se dejan intactos y se listan en el informe.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const BATCH_SIZE = 400;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const TAXONOMY_PATH = join(SCRIPT_DIR, "../src/constants/taxonomy.json");

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
  const options = { dryRun: false, user: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--user") options.user = argv[++index] ?? null;
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Uso: node scripts/migrate-tags.mjs [--dry-run] [--user <uid>]",
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
  if (path) return cert(JSON.parse(readFileSync(path, "utf8")));

  throw new Error(
    "Falta la service account: define FIREBASE_SERVICE_ACCOUNT_PATH en .env o en el entorno.",
  );
}

const normalizeText = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

function buildAliasMap(aliases) {
  const map = new Map();
  for (const [key, values] of Object.entries(aliases)) {
    map.set(normalizeText(key), key);
    values.forEach((value) => map.set(normalizeText(value), key));
  }
  return map;
}

function normalizeCategory(category) {
  const normalized = category.trim().toLowerCase();
  if (["idioma", "language", "lang"].includes(normalized)) return "idioma";
  if (["género", "genero", "genre", "gênero"].includes(normalized)) {
    return "género";
  }
  return normalized;
}

function userFromDocument(document) {
  const collectionRef = document.ref.parent;
  const userRef = collectionRef.parent;
  const usersRef = userRef?.parent;

  if (!userRef || usersRef?.id !== "users") return null;
  return userRef.id;
}

function sameTags(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function main() {
  loadEnvFile();
  const options = parseArgs(process.argv.slice(2));
  const taxonomy = JSON.parse(readFileSync(TAXONOMY_PATH, "utf8"));
  const genreAliases = buildAliasMap(taxonomy.genres);
  const languageAliases = buildAliasMap(taxonomy.languages);

  initializeApp({ credential: loadCredential() });
  const db = getFirestore();

  console.log(
    `Migrando etiquetas de idioma y género a claves canónicas${
      options.dryRun ? " (dry-run)" : ""
    }`,
  );

  const snapshot = await db.collectionGroup("collection").get();
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
    documents: documents.length,
    changed: 0,
    unchanged: 0,
    conflicts: 0,
    unknown: 0,
    errors: 0,
  };
  const unknownValues = [];
  const conflictValues = [];

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
    const data = document.data();
    if (!Array.isArray(data.tags) || data.tags.length === 0) {
      summary.unchanged += 1;
      continue;
    }

    try {
      const result = [];
      const seen = new Set();
      let hasGenre = false;
      let hasLanguage = false;

      for (const rawTag of data.tags) {
        if (
          !rawTag ||
          typeof rawTag.category !== "string" ||
          typeof rawTag.value !== "string"
        ) {
          continue;
        }

        const category = normalizeCategory(rawTag.category);
        const value = rawTag.value.trim();
        if (!value) continue;

        let canonical = null;
        let unknown = false;

        if (category === "género") {
          canonical = genreAliases.get(normalizeText(value)) ?? null;
          unknown = canonical === null;
        } else if (category === "idioma") {
          canonical = languageAliases.get(normalizeText(value)) ?? null;
          unknown = canonical === null;
        }

        if (unknown) {
          // No se borra: se conserva tal cual y se reporta.
          result.push({ category: rawTag.category, value: rawTag.value });
          summary.unknown += 1;
          unknownValues.push(
            `${document.ref.path} · ${rawTag.category}: ${rawTag.value}`,
          );
          continue;
        }

        if (canonical !== null) {
          if (category === "género") {
            if (hasGenre) {
              summary.conflicts += 1;
              conflictValues.push(
                `${document.ref.path} · género descartado: ${value}`,
              );
              continue;
            }
            hasGenre = true;
          } else {
            if (hasLanguage) {
              summary.conflicts += 1;
              conflictValues.push(
                `${document.ref.path} · idioma descartado: ${value}`,
              );
              continue;
            }
            hasLanguage = true;
          }

          const next = { category, value: canonical };
          const key = `${next.category}:${next.value}`;
          if (seen.has(key)) continue;
          seen.add(key);
          result.push(next);
          continue;
        }

        // Categorías libres: solo se normaliza la categoría.
        const next = { category, value };
        const key = `${next.category}:${next.value.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(next);
      }

      if (sameTags(result, data.tags)) {
        summary.unchanged += 1;
        continue;
      }

      summary.changed += 1;
      if (options.dryRun) {
        console.log(
          `  [dry] ${document.ref.path}\n        antes: ${JSON.stringify(data.tags)}\n        después: ${JSON.stringify(result)}`,
        );
      } else {
        batch.update(document.ref, { tags: result });
        pendingWrites += 1;
        if (pendingWrites >= BATCH_SIZE) await flush();
      }
    } catch (error) {
      summary.errors += 1;
      console.error(`Error en ${document.ref.path}:`, error);
    }
  }

  await flush();

  console.log("\nResumen");
  console.log(`  Usuarios: ${summary.users.size}`);
  console.log(`  Documentos: ${summary.documents}`);
  console.log(`  Cambiados: ${summary.changed}`);
  console.log(`  Sin cambios: ${summary.unchanged}`);
  console.log(`  Conflictos (valor descartado): ${summary.conflicts}`);
  console.log(`  Valores no reconocidos: ${summary.unknown}`);
  console.log(`  Errores: ${summary.errors}`);

  if (unknownValues.length > 0) {
    console.log("\nValores no reconocidos (se conservan):");
    unknownValues.forEach((line) => console.log(`  - ${line}`));
  }

  if (conflictValues.length > 0) {
    console.log("\nConflictos (se conserva el primer valor):");
    conflictValues.forEach((line) => console.log(`  - ${line}`));
  }

  if (options.dryRun) {
    console.log("\nDry-run: no se modificó ningún documento.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
