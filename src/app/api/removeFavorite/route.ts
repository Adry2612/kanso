/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Album } from "../../../../models/album";

export async function DELETE(request: NextRequest) {
  try {
    const { album, userId }: { album: Album; userId: string } =
      await request.json();

    const albumsCollection = collection(db, "albums");
    const favoritesCollection = collection(db, "users", userId, "favorites");

    // Buscar el álbum en la colección albums
    const albumQuery = query(albumsCollection, where("id", "==", album.id));
    const albumRes = await getDocs(albumQuery);

    if (albumRes.empty) {
      return NextResponse.json(
        { error: "Álbum no encontrado" },
        { status: 404 },
      );
    }

    const albumDocId = albumRes.docs[0].id;

    // Buscar si el usuario tiene este álbum en favoritos
    const favoriteQuery = query(
      favoritesCollection,
      where("albumId", "==", albumDocId),
    );
    const favoriteRes = await getDocs(favoriteQuery);

    if (favoriteRes.empty) {
      return NextResponse.json(
        { message: "El álbum no está en favoritos" },
        { status: 404 },
      );
    }

    // Eliminar todas las entradas (en teoría debería haber solo una)
    const deletePromises = favoriteRes.docs.map((favDoc) =>
      deleteDoc(doc(db, "users", userId, "favorites", favDoc.id)),
    );
    await Promise.all(deletePromises);

    return NextResponse.json({ message: "Favorito eliminado correctamente" });
  } catch (error: any) {
    console.error("Error en deleteFavorite API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 },
    );
  }
}
