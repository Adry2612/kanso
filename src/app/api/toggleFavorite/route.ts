import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { Album } from "../../../../models/album";
import { FavoriteFormat, FavoriteTag } from "@/types/favorites";
import { normalizeMoods } from "@/constants/moods";
import { reportApiError } from "@/lib/sentry";

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const {
      album,
      feelings,
      format = ["digital"],
      activities: activitiesInput = [],
      tags = [],
    }: {
      album: Album;
      feelings: Array<string>;
      format?: FavoriteFormat[];
      activities?: Array<string>;
      tags?: FavoriteTag[];
    } = await request.json();

    if (!album || typeof album.id !== "string" || !album.id.trim()) {
      return NextResponse.json({ error: "Álbum no válido" }, { status: 400 });
    }

    const feelingList = Array.isArray(feelings) ? feelings : [];
    const normalizedFeelings = normalizeMoods(
      feelingList.map((feeling: unknown) =>
        typeof feeling === "string"
          ? feeling
          : typeof (feeling as { label?: unknown })?.label === "string"
            ? (feeling as { label: string }).label
            : "",
      ),
    );

    const activities = Array.isArray(activitiesInput)
      ? activitiesInput
          .filter(
            (activity): activity is string => typeof activity === "string",
          )
          .map((activity) => activity.trim())
          .filter(Boolean)
      : [];

    const validFormats: FavoriteFormat[] = [
      "digital",
      "cd",
      "cassette",
      "vinyl",
    ];
    const formats = Array.isArray(format) ? [...new Set(format)] : [];
    const normalizedTags = Array.isArray(tags)
      ? tags
          .filter(
            (tag): tag is FavoriteTag =>
              typeof tag?.category === "string" &&
              typeof tag?.value === "string",
          )
          .map((tag) => ({
            category: tag.category.trim().toLowerCase(),
            value: tag.value.trim().toLowerCase(),
          }))
          .filter((tag) => tag.category && tag.value)
      : [];
    if (
      formats.length === 0 ||
      formats.some((selectedFormat) => !validFormats.includes(selectedFormat))
    ) {
      return NextResponse.json({ error: "Formato no válido" }, { status: 400 });
    }

    const db = adminDb();
    const albumsCollection = db.collection("albums");
    const favoritesCollection = db.collection(`users/${uid}/favorites`);
    const listenLaterCollection = db.collection(`users/${uid}/listenLater`);

    const res = await albumsCollection.where("id", "==", album.id).get();

    let albumDocId: string;

    if (res.empty) {
      const docRef = await albumsCollection.add(album);
      albumDocId = docRef.id;
    } else {
      albumDocId = res.docs[0].id;
    }

    const favoriteRes = await favoritesCollection
      .where("albumId", "==", albumDocId)
      .get();
    const pendingRef = listenLaterCollection.doc(albumDocId);

    if (!favoriteRes.empty) {
      const batch = db.batch();
      batch.set(
        favoriteRes.docs[0].ref,
        {
          labeledFeelings: normalizedFeelings,
          activities,
          format: formats,
          tags: normalizedTags,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      batch.delete(pendingRef);
      await batch.commit();

      return NextResponse.json(
        {
          message: "Favorito actualizado",
          alreadyFavorite: true,
          feelings: normalizedFeelings,
          activities,
          format: formats,
          tags: normalizedTags,
        },
        { status: 200 },
      );
    }

    const batch = db.batch();
    batch.set(favoritesCollection.doc(albumDocId), {
      albumId: albumDocId,
      labeledFeelings: normalizedFeelings,
      activities,
      format: formats,
      tags: normalizedTags,
      addedAt: FieldValue.serverTimestamp(),
    });
    batch.delete(pendingRef);
    await batch.commit();

    // Feed global y anónimo de últimos álbumes añadidos por la comunidad.
    // No bloquea el guardado: si falla, el favorito ya está guardado.
    try {
      await db
        .doc(`communityAlbums/${albumDocId}`)
        .set(
          { albumId: albumDocId, addedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
    } catch (feedError) {
      reportApiError(feedError, "toggleFavorite", "warning");
    }

    return NextResponse.json({
      message: "Favorito guardado",
      feelings: normalizedFeelings,
      activities,
      format: formats,
      tags: normalizedTags,
    });
  } catch (error) {
    reportApiError(error, "toggleFavorite");
    return NextResponse.json(
      { error: "No se pudo guardar el álbum" },
      { status: 500 },
    );
  }
}
