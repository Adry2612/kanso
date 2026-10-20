import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import { toIsoDate } from "@/lib/friends";
import type { FriendPerson, FriendRequestEntry } from "@/types/friends";

export const dynamic = "force-dynamic";

function personFromData(
  uid: string,
  data: Record<string, unknown>,
): FriendPerson {
  return {
    uid,
    displayName:
      typeof data.displayName === "string" && data.displayName.trim()
        ? data.displayName.trim()
        : "Persona",
    photoURL:
      typeof data.photoURL === "string" && data.photoURL.trim()
        ? data.photoURL.trim()
        : null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  const { uid } = auth;

  try {
    const db = adminDb();
    const snapshot = await db
      .collection("friendRequests")
      .where("toUid", "==", uid)
      .get();

    const fromUids = [
      ...new Set(snapshot.docs.map((doc) => String(doc.data().fromUid))),
    ];
    const people = new Map<string, FriendPerson>();

    if (fromUids.length > 0) {
      const profiles = await db.getAll(
        ...fromUids.map((fromUid) => db.doc(`users/${fromUid}`)),
      );
      profiles.forEach((profile) => {
        if (!profile.exists) return;
        people.set(
          profile.id,
          personFromData(profile.id, profile.data() ?? {}),
        );
      });
    }

    const incoming: FriendRequestEntry[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        const fromUid = String(data.fromUid);
        return {
          id: doc.id,
          person: people.get(fromUid) ?? {
            uid: fromUid,
            displayName: "Persona",
            photoURL: null,
          },
          createdAt: toIsoDate(data.createdAt),
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    return NextResponse.json(
      { incoming },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error obteniendo notificaciones de amistad:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las solicitudes." },
      { status: 500 },
    );
  }
}
