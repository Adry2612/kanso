import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import { parseAvatarDataUrl } from "@/lib/avatar";
import { adminDb, getAdminApp } from "@/lib/firebaseAdmin";
import { ensureUserProfile, FriendApiError } from "@/lib/friends";

export const dynamic = "force-dynamic";

function avatarURL(uid: string) {
  return `/api/avatar/${uid}?v=${Date.now()}`;
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  let body: { dataUrl?: unknown };
  try {
    body = (await request.json()) as { dataUrl?: unknown };
  } catch {
    return NextResponse.json(
      { error: "La imagen no es válida." },
      { status: 400 },
    );
  }

  const parsed = parseAvatarDataUrl(body.dataUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "Usa una imagen JPG, PNG o WebP de menos de 300 KB." },
      { status: 400 },
    );
  }

  try {
    const db = adminDb();
    await ensureUserProfile(auth.uid);

    await db.doc(`avatars/${auth.uid}`).set({
      data: parsed.base64,
      contentType: parsed.contentType,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const photoURL = avatarURL(auth.uid);
    await db.doc(`users/${auth.uid}`).set(
      {
        photoURL,
        photoSource: "custom",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json(
      { photoURL },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Error guardando la foto de perfil:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la foto de perfil." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  try {
    const db = adminDb();
    await ensureUserProfile(auth.uid);
    const authUser = await getAuth(getAdminApp()).getUser(auth.uid);
    const googlePhoto =
      typeof authUser.photoURL === "string" && authUser.photoURL.trim()
        ? authUser.photoURL.trim()
        : null;

    await db.doc(`avatars/${auth.uid}`).delete();
    await db.doc(`users/${auth.uid}`).set(
      {
        photoURL: googlePhoto,
        photoSource: googlePhoto ? "google" : null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json(
      { photoURL: googlePhoto ?? null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Error eliminando la foto de perfil:", error);
    return NextResponse.json(
      { error: "No se pudo quitar la foto de perfil." },
      { status: 500 },
    );
  }
}
