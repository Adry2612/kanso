import "server-only";

import { Buffer } from "node:buffer";

export const AVATAR_MAX_BYTES = 300_000;

const AVATAR_DATA_URL_PATTERN =
  /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

type ParsedAvatar = {
  base64: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  bytes: Buffer;
};

function matchesImageSignature(bytes: Buffer, contentType: string) {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  // WebP: "RIFF" + tamaño + "WEBP".
  return (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

/**
 * Acepta únicamente una imagen raster pequeña en data URL.
 *
 * El cliente ya la recorta y la comprime; la API vuelve a validar el tipo, el
 * tamaño y la firma para no guardar contenido arbitrario en Firestore.
 */
export function parseAvatarDataUrl(value: unknown): ParsedAvatar | null {
  if (typeof value !== "string") return null;

  const match = AVATAR_DATA_URL_PATTERN.exec(value);
  if (!match) return null;

  const contentType = match[1] as ParsedAvatar["contentType"];
  const base64 = match[2];
  const bytes = Buffer.from(base64, "base64");

  if (bytes.length === 0 || bytes.length > AVATAR_MAX_BYTES) return null;
  if (!matchesImageSignature(bytes, contentType)) return null;

  return { base64, contentType, bytes };
}
