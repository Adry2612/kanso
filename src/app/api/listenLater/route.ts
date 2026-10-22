import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { Album } from "../../../../models/album";
import type { ListenLaterAlbum } from "@/types/favorites";
import type { SpotifyAlbum } from "@/types/spotify";

function toIsoDate(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return null;
}

function isValidAlbum(album: unknown): album is Album {
  return Boolean(
    album &&
    typeof album === "object" &&
    typeof (album as { id?: unknown }).id === "string" &&
    (album as { id: string }).id.trim(),
  );
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const db = adminDb();
    const snapshot = await db
      .collection(`users/${uid}/listenLater`)
      .orderBy("addedAt", "desc")
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ albums: [] });
    }

    // La colección gana si alguna entrada quedó duplicada por una escritura
    // parcial o por datos antiguos.
    const favoritesSnapshot = await db
      .collection(`users/${uid}/favorites`)
      .get();
    const favoriteAlbumIds = new Set(
      favoritesSnapshot.docs
        .map((favoriteDoc) => favoriteDoc.data().albumId)
        .filter(
          (albumId): albumId is string =>
            typeof albumId === "string" && Boolean(albumId.trim()),
        ),
    );

    const albums = await Promise.all(
      snapshot.docs.map(
        async (pendingDoc): Promise<ListenLaterAlbum | null> => {
          const { albumId, addedAt } = pendingDoc.data();

          if (
            typeof albumId !== "string" ||
            !albumId.trim() ||
            favoriteAlbumIds.has(albumId)
          ) {
            return null;
          }

          const albumSnap = await db.doc(`albums/${albumId}`).get();
          if (!albumSnap.exists) return null;

          const albumData = albumSnap.data() as SpotifyAlbum | undefined;
          if (!albumData) return null;

          return {
            id: pendingDoc.id,
            albumId,
            addedAt: toIsoDate(addedAt) ?? new Date(0).toISOString(),
            album: albumData,
          } satisfies ListenLaterAlbum;
        },
      ),
    );

    return NextResponse.json({
      albums: albums.filter(
        (album): album is ListenLaterAlbum => album !== null,
      ),
    });
  } catch (error) {
    console.error("Error obteniendo pendientes:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener los pendientes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const { album }: { album?: Album } = await request.json();

    if (!isValidAlbum(album)) {
      return NextResponse.json({ error: "Álbum no válido" }, { status: 400 });
    }

    const db = adminDb();
    const albumsCollection = db.collection("albums");
    const favoritesCollection = db.collection(`users/${uid}/favorites`);
    const listenLaterCollection = db.collection(`users/${uid}/listenLater`);

    const albumRes = await albumsCollection.where("id", "==", album.id).get();

    let albumDocId: string;
    let albumData: Album;

    if (albumRes.empty) {
      const albumRef = await albumsCollection.add(album);
      albumDocId = albumRef.id;
      albumData = album;
    } else {
      albumDocId = albumRes.docs[0].id;
      albumData = albumRes.docs[0].data() as Album;
    }

    const favoriteRes = await favoritesCollection
      .where("albumId", "==", albumDocId)
      .get();

    if (!favoriteRes.empty) {
      return NextResponse.json(
        { error: "Este álbum ya está en tu colección" },
        { status: 409 },
      );
    }

    const pendingRef = listenLaterCollection.doc(albumDocId);
    const pendingSnap = await pendingRef.get();

    if (pendingSnap.exists) {
      const pendingData = pendingSnap.data() ?? {};
      return NextResponse.json({
        message: "El álbum ya estaba en pendientes",
        alreadyPending: true,
        album: {
          id: pendingSnap.id,
          albumId: pendingData.albumId ?? albumDocId,
          addedAt: toIsoDate(pendingData.addedAt) ?? new Date(0).toISOString(),
          album: albumData as unknown as SpotifyAlbum,
        } satisfies ListenLaterAlbum,
      });
    }

    await pendingRef.set({
      albumId: albumDocId,
      addedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      message: "Álbum guardado para escuchar",
      alreadyPending: false,
      album: {
        id: albumDocId,
        albumId: albumDocId,
        addedAt: new Date().toISOString(),
        album: albumData as unknown as SpotifyAlbum,
      } satisfies ListenLaterAlbum,
    });
  } catch (error) {
    console.error("Error guardando pendiente:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el álbum para escuchar" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const { album }: { album?: Album } = await request.json();

    if (!isValidAlbum(album)) {
      return NextResponse.json({ error: "Álbum no válido" }, { status: 400 });
    }

    const db = adminDb();
    const albumRes = await db
      .collection("albums")
      .where("id", "==", album.id)
      .get();

    if (albumRes.empty) {
      return NextResponse.json({
        message: "El álbum no está en pendientes",
        removed: false,
      });
    }

    const albumDocId = albumRes.docs[0].id;
    const pendingRes = await db
      .collection(`users/${uid}/listenLater`)
      .where("albumId", "==", albumDocId)
      .get();

    if (pendingRes.empty) {
      return NextResponse.json({
        message: "El álbum no está en pendientes",
        removed: false,
      });
    }

    await Promise.all(
      pendingRes.docs.map((pendingDoc) => pendingDoc.ref.delete()),
    );

    return NextResponse.json({
      message: "Álbum eliminado de pendientes",
      removed: true,
    });
  } catch (error) {
    console.error("Error eliminando pendiente:", error);
    return NextResponse.json(
      { error: "No se pudo quitar el álbum de pendientes" },
      { status: 500 },
    );
  }
}
