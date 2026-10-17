import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { Album } from "../../../../models/album";

export async function DELETE(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const { album }: { album: Album } = await request.json();

    if (!album || typeof album.id !== "string" || !album.id.trim()) {
      return NextResponse.json({ error: "Álbum no válido" }, { status: 400 });
    }

    const db = adminDb();
    const albumsCollection = db.collection("albums");
    const favoritesCollection = db.collection(`users/${uid}/favorites`);

    // Buscar el álbum en la colección albums
    const albumRes = await albumsCollection.where("id", "==", album.id).get();

    if (albumRes.empty) {
      return NextResponse.json({
        message: "El álbum no está en favoritos",
        removed: false,
      });
    }

    const albumDocId = albumRes.docs[0].id;

    // Buscar si el usuario tiene este álbum en favoritos
    const favoriteRes = await favoritesCollection
      .where("albumId", "==", albumDocId)
      .get();

    if (favoriteRes.empty) {
      return NextResponse.json({
        message: "El álbum no está en favoritos",
        removed: false,
      });
    }

    // Eliminar todas las entradas (en teoría debería haber solo una)
    await Promise.all(favoriteRes.docs.map((favDoc) => favDoc.ref.delete()));

    return NextResponse.json({
      message: "Favorito eliminado correctamente",
      removed: true,
    });
  } catch (error) {
    console.error("Error en removeFavorite API:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el álbum" },
      { status: 500 },
    );
  }
}
