import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import {
  ensureUserProfile,
  FriendApiError,
  normalizeSharing,
} from "@/lib/friends";
import type { FriendSharingSettings } from "@/types/friends";

export const dynamic = "force-dynamic";

const SHARING_KEYS = [
  "recommendations",
  "collection",
  "artists",
] as const satisfies readonly (keyof FriendSharingSettings)[];

type SharingPatch = Partial<FriendSharingSettings>;

function parsePatch(body: unknown): SharingPatch | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  const entries = Object.entries(body as Record<string, unknown>);
  if (entries.length === 0) return null;

  const patch: SharingPatch = {};
  for (const [key, value] of entries) {
    if (!SHARING_KEYS.includes(key as keyof FriendSharingSettings)) {
      return null;
    }
    if (typeof value !== "boolean") return null;
    patch[key as keyof FriendSharingSettings] = value;
  }

  return patch;
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "La configuración no es válida." },
      { status: 400 },
    );
  }

  const patch = parsePatch(body);
  if (!patch) {
    return NextResponse.json(
      { error: "La configuración no es válida." },
      { status: 400 },
    );
  }

  try {
    const profile = await ensureUserProfile(auth.uid);
    const sharing = normalizeSharing({ ...profile.sharing, ...patch });

    await adminDb().doc(`users/${auth.uid}`).set({ sharing }, { merge: true });

    return NextResponse.json(
      { sharing },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Error guardando la compartición:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración." },
      { status: 500 },
    );
  }
}
