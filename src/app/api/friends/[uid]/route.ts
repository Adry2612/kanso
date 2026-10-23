import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import { isValidUid, requestDocumentId } from "@/lib/friends";
import { reportApiError } from "@/lib/sentry";

type RouteContext = { params: Promise<{ uid: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  const { uid } = auth;
  const { uid: targetUid } = await context.params;

  if (!isValidUid(targetUid)) {
    return NextResponse.json({ error: "Amistad no válida." }, { status: 400 });
  }

  if (targetUid === uid) {
    return NextResponse.json(
      { error: "No puedes eliminarte a ti mismo." },
      { status: 400 },
    );
  }

  try {
    const db = adminDb();
    const batch = db.batch();

    batch.delete(db.doc(`users/${uid}/friends/${targetUid}`));
    batch.delete(db.doc(`users/${targetUid}/friends/${uid}`));
    // Limpiar solicitudes residuales permite volver a enviar una más adelante.
    batch.delete(db.doc(`friendRequests/${requestDocumentId(uid, targetUid)}`));
    batch.delete(db.doc(`friendRequests/${requestDocumentId(targetUid, uid)}`));

    await batch.commit();

    return NextResponse.json({ status: "removed" });
  } catch (error) {
    reportApiError(error, "friends/[uid]");
    return NextResponse.json(
      { error: "No se pudo eliminar la amistad." },
      { status: 500 },
    );
  }
}
