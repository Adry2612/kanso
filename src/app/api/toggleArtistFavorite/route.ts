import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const body = await request.json().catch(() => ({}));
    const { artist } = body ?? {};

    if (!artist?.id) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const ref = adminDb().doc(`users/${uid}/artists/${artist.id}`);
    const existing = await ref.get();

    if (existing.exists) {
      await ref.delete();
      return NextResponse.json({ favorite: false });
    }

    await ref.set({
      artistId: artist.id,
      name: artist.name ?? "",
      images: artist.images ?? [],
      genres: artist.genres ?? [],
      followers: artist.followers ?? null,
      addedAt: new Date(),
    });

    return NextResponse.json({ favorite: true });
  } catch (error) {
    reportApiError(error, "toggleArtistFavorite");
    return NextResponse.json(
      { error: "No se pudo actualizar el artista favorito" },
      { status: 500 },
    );
  }
}
