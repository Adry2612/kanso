import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import {
  ensureUserProfile,
  FriendApiError,
  friendshipData,
  getUserSummary,
  isValidUid,
  normalizeFriendCode,
  requestDocumentId,
} from "@/lib/friends";
import type { FriendRequestResult } from "@/types/friends";

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  const { uid } = auth;

  let body: { code?: unknown };
  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    return NextResponse.json(
      { error: "El código no tiene el formato correcto." },
      { status: 400 },
    );
  }

  const code = normalizeFriendCode(body.code);
  if (!code) {
    return NextResponse.json(
      { error: "El código no tiene el formato correcto." },
      { status: 400 },
    );
  }

  try {
    const db = adminDb();
    const codeSnapshot = await db.doc(`friendCodes/${code}`).get();
    if (!codeSnapshot.exists) {
      return NextResponse.json(
        { error: "No encontramos ese código." },
        { status: 404 },
      );
    }

    const targetUid = codeSnapshot.data()?.uid;
    if (!isValidUid(targetUid)) {
      return NextResponse.json(
        { error: "No encontramos ese código." },
        { status: 404 },
      );
    }

    if (targetUid === uid) {
      return NextResponse.json(
        { error: "No puedes añadirte a ti mismo." },
        { status: 400 },
      );
    }

    const target = await getUserSummary(targetUid);
    if (!target) {
      return NextResponse.json(
        { error: "No encontramos ese código." },
        { status: 404 },
      );
    }

    const me = await ensureUserProfile(uid);
    const friendRef = db.doc(`users/${uid}/friends/${targetUid}`);
    const targetFriendRef = db.doc(`users/${targetUid}/friends/${uid}`);
    const directRef = db.doc(
      `friendRequests/${requestDocumentId(uid, targetUid)}`,
    );
    const reverseRef = db.doc(
      `friendRequests/${requestDocumentId(targetUid, uid)}`,
    );

    const result = await db.runTransaction<FriendRequestResult>(async (tx) => {
      const friendSnapshot = await tx.get(friendRef);
      if (friendSnapshot.exists) {
        throw new FriendApiError(409, "Ya sois amigos.");
      }

      const directSnapshot = await tx.get(directRef);
      if (directSnapshot.exists) {
        throw new FriendApiError(409, "Ya has enviado una solicitud.");
      }

      const reverseSnapshot = await tx.get(reverseRef);
      if (reverseSnapshot.exists) {
        // La otra persona ya te había escrito: la solicitud recíproca se
        // convierte en amistad y no queda ningún pendiente.
        tx.set(friendRef, friendshipData(target));
        tx.set(targetFriendRef, friendshipData(me));
        tx.delete(reverseRef);
        tx.delete(directRef);
        return { status: "accepted" };
      }

      tx.set(directRef, {
        fromUid: uid,
        toUid: targetUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { status: "pending" };
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Error enviando solicitud de amistad:", error);
    return NextResponse.json(
      { error: "No se pudo enviar la solicitud." },
      { status: 500 },
    );
  }
}
