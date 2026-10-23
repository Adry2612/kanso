import { NextRequest, NextResponse } from "next/server";
import { authenticate, isAuthFailure, requireRegistered } from "@/lib/apiAuth";
import { ensureUserProfile, FriendApiError } from "@/lib/friends";
import { reportApiError } from "@/lib/sentry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const denied = requireRegistered(auth);
  if (denied) return denied;

  try {
    const profile = await ensureUserProfile(auth.uid);
    return NextResponse.json(
      { profile },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FriendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "profile");
    return NextResponse.json(
      { error: "No se pudo cargar el perfil." },
      { status: 500 },
    );
  }
}
