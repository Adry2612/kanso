"use client";

import { authFetch } from "@/lib/api/authFetch";
import type {
  FriendRequestAction,
  FriendRequestNotificationsResponse,
  FriendRequestResult,
  FriendsResponse,
  FriendSharingSettings,
  PublicProfileResponse,
} from "@/types/friends";
import type { FriendLibraryResponse } from "@/types/friends";

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

export async function getFriendRequestNotifications(): Promise<
  FriendRequestNotificationsResponse["incoming"]
> {
  const response = await authFetch("/api/friends/notifications");
  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudieron cargar las solicitudes."),
    );
  }
  const data = (await response.json()) as FriendRequestNotificationsResponse;
  return data.incoming ?? [];
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

export async function getFriendLibrary(
  uid: string,
): Promise<FriendLibraryResponse | null> {
  const response = await authFetch(
    `/api/friends/${encodeURIComponent(uid)}/library`,
  );

  // 404 y 403 comparten el mismo mensaje genérico en la UI: no distinguimos
  // entre «no existe» y «no es tu amigo» para no filtrar información.
  if (response.status === 404 || response.status === 403) return null;

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo cargar la biblioteca."),
    );
  }

  return (await response.json()) as FriendLibraryResponse;
}

export async function updateSharing(
  settings: Partial<FriendSharingSettings>,
): Promise<FriendSharingSettings> {
  const response = await authFetch("/api/friends/sharing", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo guardar la configuración."),
    );
  }

  const data = (await response.json()) as { sharing: FriendSharingSettings };
  return data.sharing;
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
