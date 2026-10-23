import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import {
  ensureUserProfile,
  FriendApiError,
  friendshipData,
  getUserSummary,
  isValidUid,
  requestDocumentId,
} from "@/lib/friends";
import type {
  FriendPerson,
  FriendProfile,
  FriendRequestAction,
} from "@/types/friends";
import { reportApiError } from "@/lib/sentry";

type RouteContext = { params: Promise<{ id: string }> };

const REQUEST_ID_PATTERN = /^[A-Za-z0-9]+_[A-Za-z0-9]+$/;

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  const { uid } = auth;
  const { id } = await context.params;

  if (!REQUEST_ID_PATTERN.test(id)) {
    return NextResponse.json(
      { error: "La solicitud ya no está disponible." },
      { status: 404 },
    );
  }

  let body: { action?: unknown };
  try {
    body = (await request.json()) as { action?: unknown };
  } catch {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  const action: FriendRequestAction | null =
    body.action === "accept" || body.action === "reject" ? body.action : null;
  if (!action) {
    return NextResponse.json({ error: "Acción no válida." }, { status: 400 });
  }

  try {
    const db = adminDb();
    const requestRef = db.doc(`friendRequests/${id}`);
    const requestSnapshot = await requestRef.get();

    if (!requestSnapshot.exists) {
      return NextResponse.json(
        { error: "La solicitud ya no está disponible." },
        { status: 404 },
      );
    }

    const data = requestSnapshot.data() ?? {};
    if (data.toUid !== uid) {
      return NextResponse.json(
        { error: "No puedes responder a esta solicitud." },
        { status: 403 },
      );
    }

    const fromUid = data.fromUid;
    if (!isValidUid(fromUid) || requestDocumentId(fromUid, uid) !== id) {
      return NextResponse.json(
        { error: "La solicitud ya no está disponible." },
        { status: 404 },
      );
    }

    let me: FriendProfile | null = null;
    let sender: FriendPerson | null = null;
    if (action === "accept") {
      [me, sender] = await Promise.all([
        ensureUserProfile(uid),
        getUserSummary(fromUid),
      ]);

      if (!sender) {
        return NextResponse.json(
          { error: "La solicitud ya no está disponible." },
          { status: 404 },
        );
      }
    }

    const result = await db.runTransaction(async (tx) => {
      const freshSnapshot = await tx.get(requestRef);
      if (!freshSnapshot.exists) {
        throw new FriendApiError(404, "La solicitud ya no está disponible.");
      }

      const freshData = freshSnapshot.data() ?? {};
      if (freshData.toUid !== uid) {
        throw new FriendApiError(403, "No puedes responder a esta solicitud.");
      }

      if (action === "reject") {
        tx.delete(requestRef);
        return { status: "rejected" as const };
      }

      if (!me || !sender) {
        throw new FriendApiError(404, "La solicitud ya no está disponible.");
      }

      const reverseRequestRef = db.doc(
        `friendRequests/${requestDocumentId(uid, fromUid)}`,
      );
      const reverseSnapshot = await tx.get(reverseRequestRef);

      tx.set(db.doc(`users/${uid}/friends/${fromUid}`), friendshipData(sender));
      tx.set(db.doc(`users/${fromUid}/friends/${uid}`), friendshipData(me));
      tx.delete(requestRef);
      if (reverseSnapshot.exists) tx.delete(reverseRequestRef);

      return { status: "accepted" as const };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "friends/requests/[id]");
    return NextResponse.json(
      { error: "No se pudo responder a la solicitud." },
      { status: 500 },
    );
  }
}
