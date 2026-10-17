import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const snapshot = await adminDb().collection(`users/${uid}/artists`).get();

    const artists = snapshot.docs.map((entry) => {
      const data = entry.data();
      return {
        id: data.artistId ?? entry.id,
        name: data.name ?? "",
        images: data.images ?? [],
        genres: data.genres ?? [],
        followers: data.followers ?? null,
        addedAt: data.addedAt?.toDate?.() ?? data.addedAt ?? null,
      };
    });

    artists.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );

    return NextResponse.json({ artists });
  } catch (error) {
    console.error("Error obteniendo artistas favoritos:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener tus artistas" },
      { status: 500 },
    );
  }
}
