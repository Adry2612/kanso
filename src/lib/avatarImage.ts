"use client";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const AVATAR_SIZE = 256;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Recorta la imagen en cuadrado y la reduce antes de enviarla.
 *
 * Así la API recibe una imagen pequeña y predecible, y el documento de Firestore
 * no se acerca al límite de 1 MB.
 */
export async function resizeImageToAvatarDataUrl(file: File): Promise<string> {
  if (!SUPPORTED_TYPES.has(file.type)) {
    throw new Error("unsupported-type");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("file-too-large");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-unavailable");

    const scale = Math.max(
      AVATAR_SIZE / bitmap.width,
      AVATAR_SIZE / bitmap.height,
    );
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
    context.drawImage(
      bitmap,
      (AVATAR_SIZE - width) / 2,
      (AVATAR_SIZE - height) / 2,
      width,
      height,
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    if (!dataUrl.startsWith("data:image/jpeg;base64,")) {
      throw new Error("canvas-unavailable");
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
