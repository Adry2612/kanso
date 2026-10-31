import { NextResponse } from "next/server";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";
import { getAlbum } from "@/services/server/albums";
import { deriveAlbumGenreBranches } from "@/services/server/genres";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const albumId = new URL(request.url).searchParams.get("albumId");
  if (!albumId) {
    return NextResponse.json({ error: "Falta el álbum" }, { status: 400 });
  }

  try {
    const album = await getAlbum(albumId);
    const genres = await deriveAlbumGenreBranches(album);
    return NextResponse.json({ genres });
  } catch (error) {
    // El guardado no debe bloquearse si Spotify falla: se devuelve sin género.
    reportApiError(error, "albumGenres", "warning");
    return NextResponse.json({ genres: [] });
  }
}
