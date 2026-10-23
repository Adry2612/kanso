import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import {
  loadSharedArtists,
  loadSharedCollection,
  loadSharedRecommendations,
  type FriendLibraryResponse,
} from "@/lib/friendLibrary";
import { isValidUid, normalizeSharing } from "@/lib/friends";
import { reportApiError } from "@/lib/sentry";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ uid: string }> };

function notFound() {
  return NextResponse.json(
    { error: "Perfil no disponible." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  const { uid: targetUid } = await context.params;
  if (!isValidUid(targetUid) || targetUid === auth.uid) return notFound();

  try {
    const db = adminDb();

    // La autorización se resuelve antes de leer cualquier dato de la
    // biblioteca: hacen falta las dos direcciones de la amistad.
    const [profileSnapshot, requesterFriendship, targetFriendship] =
      await Promise.all([
        db.doc(`users/${targetUid}`).get(),
        db.doc(`users/${auth.uid}/friends/${targetUid}`).get(),
        db.doc(`users/${targetUid}/friends/${auth.uid}`).get(),
      ]);

    if (
      !profileSnapshot.exists ||
      !requesterFriendship.exists ||
      !targetFriendship.exists
    ) {
      return notFound();
    }

    const data = profileSnapshot.data() ?? {};
    const sharing = normalizeSharing(data.sharing);

    const [recommendations, collection, artists] = await Promise.all([
      sharing.recommendations
        ? loadSharedRecommendations(targetUid)
        : undefined,
      sharing.collection ? loadSharedCollection(targetUid) : undefined,
      sharing.artists ? loadSharedArtists(targetUid) : undefined,
    ]);

    const response: FriendLibraryResponse = {
      profile: {
        displayName:
          typeof data.displayName === "string" && data.displayName.trim()
            ? data.displayName.trim()
            : "Persona",
        photoURL:
          typeof data.photoURL === "string" && data.photoURL.trim()
            ? data.photoURL.trim()
            : null,
      },
      sharing,
      ...(recommendations ? { recommendations } : {}),
      ...(collection ? { collection } : {}),
      ...(artists ? { artists } : {}),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    reportApiError(error, "friends/[uid]/library");
    return NextResponse.json(
      { error: "No se pudo cargar la biblioteca." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
