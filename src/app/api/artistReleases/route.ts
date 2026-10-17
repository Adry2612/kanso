import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { getArtistReleases } from "../../../../services/spotify";
import type { ArtistRelease } from "@/lib/api/artists";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Caché por artista en `artistReleases/{artistId}`: sin ningún dato de usuario. */
async function readCache(artistId: string) {
  try {
    const snap = await adminDb().doc(`artistReleases/${artistId}`).get();
    if (!snap.exists) return null;
    const data = snap.data() ?? {};
    const fetchedAt = data.fetchedAt?.toDate?.() ?? data.fetchedAt;
    return {
      releases: Array.isArray(data.releases) ? data.releases : [],
      fetchedAt: fetchedAt ? new Date(fetchedAt) : null,
    };
  } catch (error) {
    console.error(`No se pudo leer la caché del artista ${artistId}:`, error);
    return null;
  }
}

/** Nunca lanza: un artista que falla no tumba el resto de la página. */
async function resolveArtistReleases(
  artistId: string,
): Promise<ArtistRelease[]> {
  const cached = await readCache(artistId);
  if (
    cached?.fetchedAt &&
    Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS
  ) {
    return cached.releases;
  }

  try {
    const releases = await getArtistReleases(artistId);
    await adminDb()
      .doc(`artistReleases/${artistId}`)
      .set({
        releases,
        fetchedAt: new Date(),
      })
      .catch((error) => {
        console.error(
          `No se pudo guardar la caché del artista ${artistId}:`,
          error,
        );
      });
    return releases;
  } catch (error) {
    console.error(
      `No se pudieron obtener novedades del artista ${artistId}:`,
      error,
    );
    return cached?.releases ?? [];
  }
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const snapshot = await adminDb().collection(`users/${uid}/artists`).get();
    const artistIds = snapshot.docs
      .map((entry) => entry.data().artistId ?? entry.id)
      .filter((id): id is string => Boolean(id));

    if (artistIds.length === 0) {
      return NextResponse.json({ releases: [] });
    }

    const perArtist = await Promise.all(artistIds.map(resolveArtistReleases));

    const seen = new Set<string>();
    const releases = perArtist
      .flat()
      .filter((release: ArtistRelease) => {
        if (!release?.id || seen.has(release.id)) return false;
        seen.add(release.id);
        return true;
      })
      .sort((a: ArtistRelease, b: ArtistRelease) =>
        a.releaseDate < b.releaseDate ? 1 : -1,
      );

    return NextResponse.json({ releases });
  } catch (error) {
    console.error("Error obteniendo novedades de artistas:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las novedades" },
      { status: 500 },
    );
  }
}
