import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import {
  getUserSummary,
  isValidUid,
  normalizeFriendCode,
  requestDocumentId,
} from "@/lib/friends";
import type {
  PublicProfileRelation,
  PublicProfileResponse,
} from "@/types/friends";
import { reportApiError } from "@/lib/sentry";

export const dynamic = "force-dynamic";

const NOT_FOUND = { error: "Perfil no encontrado." };

export async function GET(request: NextRequest) {
  const code = normalizeFriendCode(request.nextUrl.searchParams.get("code"));

  if (!code) {
    return NextResponse.json(NOT_FOUND, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const db = adminDb();
    const codeSnapshot = await db.doc(`friendCodes/${code}`).get();
    if (!codeSnapshot.exists) {
      return NextResponse.json(NOT_FOUND, {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const targetUid = codeSnapshot.data()?.uid;
    if (!isValidUid(targetUid)) {
      return NextResponse.json(NOT_FOUND, {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const profile = await getUserSummary(targetUid);
    if (!profile) {
      return NextResponse.json(NOT_FOUND, {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    let relation: PublicProfileRelation = "none";
    let pendingDirection: "incoming" | "outgoing" | undefined;

    if (request.headers.get("authorization")) {
      const auth = await authenticate(request);
      if (!isAuthFailure(auth) && !auth.isAnonymous) {
        if (auth.uid === targetUid) {
          relation = "self";
        } else {
          const [friendSnapshot, outgoingSnapshot, incomingSnapshot] =
            await Promise.all([
              db.doc(`users/${auth.uid}/friends/${targetUid}`).get(),
              db
                .doc(`friendRequests/${requestDocumentId(auth.uid, targetUid)}`)
                .get(),
              db
                .doc(`friendRequests/${requestDocumentId(targetUid, auth.uid)}`)
                .get(),
            ]);

          if (friendSnapshot.exists) {
            relation = "friend";
          } else if (outgoingSnapshot.exists) {
            relation = "pending";
            pendingDirection = "outgoing";
          } else if (incomingSnapshot.exists) {
            relation = "pending";
            pendingDirection = "incoming";
          }
        }
      }
    }

    const response: PublicProfileResponse = {
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      relation,
      ...(pendingDirection ? { pendingDirection } : {}),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    reportApiError(error, "publicProfile");
    return NextResponse.json(
      { error: "No se pudo cargar el perfil." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
