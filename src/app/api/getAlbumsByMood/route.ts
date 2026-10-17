import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

// NUEVO: Interfaz para soportar Categoría (Tag) y sus valores (Subtags)
interface TagFilter {
  category: string;
  subtags?: string[];
}

export async function POST(request: Request) {
  const {
    moods,
    userId,
    format = "all",
    tags = [],
  }: {
    moods: string[];
    userId: string;
    format?: string;
    tags?: TagFilter[]; // NUEVO: Tipo actualizado
  } = await request.json();

  const albumsCollection = collection(db, "users", userId, "favorites");

  const matchesFormat = (album: any) => {
    if (format === "all") return true;
    const albumFormat = album.format || album.ownership?.format;
    return Array.isArray(albumFormat)
      ? albumFormat.includes(format)
      : albumFormat === format;
  };

  // NUEVO: Función para validar Tags principales y Subtags
  const matchesTagsAndSubtags = (album: any) => {
    if (!tags || tags.length === 0) return true;
    if (!album.tags || !Array.isArray(album.tags)) return false;

    return tags.every((tagFilter) => {
      const albumTagsInCategory = album.tags.filter(
        (albumTag: any) => albumTag.category === tagFilter.category,
      );

      if (albumTagsInCategory.length === 0) return false;
      if (!tagFilter.subtags || tagFilter.subtags.length === 0) return true;

      return tagFilter.subtags.some((subtag) =>
        albumTagsInCategory.some((albumTag: any) => albumTag.value === subtag),
      );
    });
  };

  // Consulta a Firestore
  let q;
  if (!moods || moods.length === 0) {
    q = query(albumsCollection, limit(50));
  } else if (moods.length === 1) {
    q = query(
      albumsCollection,
      where("labeledFeelings", "array-contains", moods[0]),
    );
  } else {
    q = query(
      albumsCollection,
      where("labeledFeelings", "array-contains-any", moods),
    );
  }

  const snap = await getDocs(q);

  // Filtrado combinando Formato + Tags + Subtags
  const filteredAlbums = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter(
      (album: any) => matchesFormat(album) && matchesTagsAndSubtags(album),
    );

  if (filteredAlbums.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron álbumes" },
      { status: 404 },
    );
  }

  // Selección aleatoria
  const randomIndex = Math.floor(Math.random() * filteredAlbums.length);
  const selectedFavorite: any = filteredAlbums[randomIndex];

  // Obtención del detalle del álbum
  const albumRef = doc(db, "albums", selectedFavorite.albumId);
  const albumSnap = await getDoc(albumRef);

  if (!albumSnap.exists()) {
    return NextResponse.json(
      { error: "No se encontró información del álbum" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { ...selectedFavorite, albumInfo: albumSnap.data() },
    { status: 200 },
  );
}
