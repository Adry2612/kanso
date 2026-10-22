import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env");
const templatePath = path.join(
  root,
  "bruno",
  "kanso-api",
  "environments",
  "Local.example.bru",
);
const outputPath = path.join(
  root,
  "bruno",
  "kanso-api",
  "environments",
  "Local.bru",
);

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index).trim(),
          line
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

const env = readDotEnv(envPath);
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!apiKey) {
  console.error(
    "No se encontró NEXT_PUBLIC_FIREBASE_API_KEY. Revisa el archivo .env.",
  );
  process.exit(1);
}

if (!fs.existsSync(templatePath)) {
  console.error(`No se encontró la plantilla: ${templatePath}`);
  process.exit(1);
}

const baseUrl = process.env.BRUNO_BASE_URL || "http://localhost:3000";
const template = fs.readFileSync(templatePath, "utf8");
const previous = fs.existsSync(outputPath)
  ? fs.readFileSync(outputPath, "utf8")
  : "";
const previousValues = new Map();

previous.split(/\r?\n/).forEach((line) => {
  const match = /^  ([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
  if (match) previousValues.set(match[1], match[2]);
});

// La plantilla define las variables; los valores ya guardados se conservan
// para no perder el token de sesión ni las credenciales de prueba.
const content = template
  .split(/\r?\n/)
  .map((line) => {
    const match = /^  ([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
    if (!match) return line;

    const key = match[1];
    if (key === "baseUrl") return `  baseUrl: ${baseUrl}`;
    if (key === "firebaseApiKey") return `  firebaseApiKey: ${apiKey}`;
    if (previousValues.has(key)) {
      const value = previousValues.get(key);
      return value ? `  ${key}: ${value}` : `  ${key}:`;
    }
    return line;
  })
  .join("\n");

fs.writeFileSync(outputPath, content.endsWith("\n") ? content : `${content}\n`);
console.log(`Entorno de Bruno generado en ${path.relative(root, outputPath)}`);
