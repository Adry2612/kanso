import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import { ensureUserProfile, FriendApiError, toIsoDate } from "@/lib/friends";
import type {
  FriendEntry,
  FriendPerson,
  FriendRequestEntry,
  FriendsResponse,
} from "@/types/friends";
import { reportApiError } from "@/lib/sentry";

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

async function loadPeople(uids: string[]): Promise<Map<string, FriendPerson>> {
  const unique = [...new Set(uids)];
  if (unique.length === 0) return new Map();

  const db = adminDb();
  const snapshots = await db.getAll(
    ...unique.map((uid) => db.doc(`users/${uid}`)),
  );

  const people = new Map<string, FriendPerson>();
  snapshots.forEach((snapshot) => {
    if (!snapshot.exists) return;
    people.set(snapshot.id, personFromData(snapshot.id, snapshot.data() ?? {}));
  });
  return people;
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  const { uid } = auth;

  try {
    const db = adminDb();
    const profile = await ensureUserProfile(uid);

    const [friendsSnapshot, incomingSnapshot, outgoingSnapshot] =
      await Promise.all([
        db.collection(`users/${uid}/friends`).get(),
        db.collection("friendRequests").where("toUid", "==", uid).get(),
        db.collection("friendRequests").where("fromUid", "==", uid).get(),
      ]);

    const people = await loadPeople([
      ...incomingSnapshot.docs.map((doc) => String(doc.data().fromUid)),
      ...outgoingSnapshot.docs.map((doc) => String(doc.data().toUid)),
    ]);

    const friends: FriendEntry[] = friendsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const person = personFromData(doc.id, data);
      return { ...person, since: toIsoDate(data.createdAt) };
    });
    friends.sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));

    const incoming: FriendRequestEntry[] = incomingSnapshot.docs
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

    const outgoing: FriendRequestEntry[] = outgoingSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        const toUid = String(data.toUid);
        return {
          id: doc.id,
          person: people.get(toUid) ?? {
            uid: toUid,
            displayName: "Persona",
            photoURL: null,
          },
          createdAt: toIsoDate(data.createdAt),
        };
      })
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    const response: FriendsResponse = {
      profile,
      friends,
      incoming,
      outgoing,
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "friends");
    return NextResponse.json(
      { error: "No se pudieron cargar los amigos." },
      { status: 500 },
    );
  }
}
