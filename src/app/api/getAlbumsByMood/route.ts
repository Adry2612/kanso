import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";

// Documento de favorito tal como se guarda en Firestore.
type FavoriteAlbum = {
  id?: string;
  albumId: string;
  format?: string | string[];
  ownership?: { format?: string | string[] };
  tags?: { category?: string; value?: string }[];
};

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;
  const { uid } = auth;

  try {
    const {
      moods,
      format = "all",
      tags = [],
    }: {
      moods: string[];
      format?: string;
      // Etiquetas en formato "categoria:valor", igual que las envía el cliente.
      tags?: string[];
    } = await request.json();

    const albumsCollection = adminDb().collection(`users/${uid}/favorites`);

    const matchesFormat = (album: FavoriteAlbum) => {
      if (format === "all") return true;
      const albumFormat = album.format || album.ownership?.format;
      return Array.isArray(albumFormat)
        ? albumFormat.includes(format)
        : albumFormat === format;
    };

    // Filtra por etiquetas "categoria:valor" sin distinguir mayúsculas/minúsculas.
    // Un álbum coincide si contiene alguna de las etiquetas seleccionadas.
    const matchesTags = (album: FavoriteAlbum) => {
      if (!tags || tags.length === 0) return true;
      const albumTags = album.tags;
      if (!albumTags || !Array.isArray(albumTags)) return false;

      return tags.some((tag) =>
        albumTags.some(
          (albumTag: { category?: string; value?: string }) =>
            `${albumTag?.category ?? ""}:${albumTag?.value ?? ""}`.toLowerCase() ===
            tag.toLowerCase(),
        ),
      );
    };

    // Consulta a Firestore
    const moodList = Array.isArray(moods) ? moods : [];
    const favoritesQuery =
      moodList.length === 0
        ? albumsCollection.limit(50)
        : moodList.length === 1
          ? albumsCollection.where(
              "labeledFeelings",
              "array-contains",
              moodList[0],
            )
          : albumsCollection.where(
              "labeledFeelings",
              "array-contains-any",
              moodList,
            );

    const snap = await favoritesQuery.get();

    // Filtrado combinando Formato + Tags
    const filteredAlbums = snap.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }) as FavoriteAlbum)
      .filter(
        (album: FavoriteAlbum) => matchesFormat(album) && matchesTags(album),
      );

    if (filteredAlbums.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron álbumes" },
        { status: 404 },
      );
    }

    // Selección aleatoria
    const randomIndex = Math.floor(Math.random() * filteredAlbums.length);
    const selectedFavorite: FavoriteAlbum = filteredAlbums[randomIndex];

    // Obtención del detalle del álbum
    const albumSnap = await adminDb()
      .doc(`albums/${selectedFavorite.albumId}`)
      .get();

    if (!albumSnap.exists) {
      return NextResponse.json(
        { error: "No se encontró información del álbum" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { ...selectedFavorite, albumInfo: albumSnap.data() },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error obteniendo álbum por estado de ánimo:", error);
    return NextResponse.json(
      { error: "No se pudo obtener la recomendación" },
      { status: 500 },
    );
  }
}
