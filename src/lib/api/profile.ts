"use client";

import { authFetch } from "./authFetch";
import type { FriendProfile } from "@/types/friends";

async function parseError(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || fallback;
  } catch {
    return fallback;
  }
}

export async function getMyProfile(): Promise<FriendProfile> {
  const response = await authFetch("/api/profile");
  if (!response.ok) {
    throw new Error(await parseError(response, "No se pudo cargar el perfil."));
  }

  const data = (await response.json()) as { profile: FriendProfile };
  return data.profile;
}

export async function uploadAvatar(
  dataUrl: string,
): Promise<{ photoURL: string }> {
  const response = await authFetch("/api/profile/avatar", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo guardar la foto de perfil."),
    );
  }

  return (await response.json()) as { photoURL: string };
}

export async function removeAvatar(): Promise<{ photoURL: string | null }> {
  const response = await authFetch("/api/profile/avatar", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, "No se pudo quitar la foto de perfil."),
    );
  }

  return (await response.json()) as { photoURL: string | null };
}
