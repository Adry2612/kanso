import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";

export async function POST(req: Request) {
  const auth = await authenticate(req);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const body = await req.json().catch(() => ({}));
    const { albumId, moods } = body ?? {};

    if (typeof albumId !== "string" || !albumId.trim()) {
      return NextResponse.json(
        { error: "Falta el álbum de la recomendación" },
        { status: 400 },
      );
    }

    const docRef = await adminDb()
      .collection(`users/${uid}/recomendationHistory`)
      .add({
        albumId,
        moods: Array.isArray(moods) ? moods : [],
        providedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
      recommendationId: docRef.id,
    });
  } catch (error) {
    console.error("Error saving recommendation:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la recomendación" },
      { status: 500 },
    );
  }
}
