import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isValidUid } from "@/lib/friends";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ uid: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { uid } = await context.params;

  if (!isValidUid(uid)) {
    return new NextResponse("Avatar no encontrado.", { status: 404 });
  }

  try {
    const snapshot = await adminDb().doc(`avatars/${uid}`).get();
    if (!snapshot.exists) {
      return new NextResponse("Avatar no encontrado.", { status: 404 });
    }

    const data = snapshot.data() ?? {};
    const base64 = typeof data.data === "string" ? data.data : "";
    const contentType =
      data.contentType === "image/png" || data.contentType === "image/webp"
        ? data.contentType
        : "image/jpeg";

    if (!base64) {
      return new NextResponse("Avatar no encontrado.", { status: 404 });
    }

    return new NextResponse(Buffer.from(base64, "base64"), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(Buffer.from(base64, "base64").byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error sirviendo el avatar:", error);
    return new NextResponse("No se pudo cargar el avatar.", { status: 500 });
  }
}
