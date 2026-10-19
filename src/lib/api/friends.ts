"use client";

import { authFetch } from "./authFetch";
import type {
  FriendRequestAction,
  FriendRequestResult,
  FriendsResponse,
  PublicProfileResponse,
} from "@/types/friends";

async function parseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export async function getFriends(): Promise<FriendsResponse> {
  const response = await authFetch("/api/friends");
  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudieron cargar los amigos."),
    );
  }
  return (await response.json()) as FriendsResponse;
}

export async function sendFriendRequest(
  code: string,
): Promise<FriendRequestResult> {
  const response = await authFetch("/api/friends/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo enviar la solicitud."),
    );
  }

  return (await response.json()) as FriendRequestResult;
}

export async function respondToFriendRequest(
  id: string,
  action: FriendRequestAction,
): Promise<{ status: "accepted" | "rejected" }> {
  const response = await authFetch(
    `/api/friends/requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo responder a la solicitud."),
    );
  }

  return (await response.json()) as { status: "accepted" | "rejected" };
}

export async function removeFriend(uid: string): Promise<void> {
  const response = await authFetch(`/api/friends/${encodeURIComponent(uid)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo eliminar la amistad."),
    );
  }
}

export async function getPublicProfile(
  code: string,
): Promise<PublicProfileResponse | null> {
  const response = await authFetch(
    `/api/publicProfile?code=${encodeURIComponent(code)}`,
  );

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(await parseError(response, "No se pudo cargar el perfil."));
  }

  return (await response.json()) as PublicProfileResponse;
}
