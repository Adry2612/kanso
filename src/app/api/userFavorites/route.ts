/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { normalizeMoods } from "@/constants/moods";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Falta el userId" }, { status: 400 });
    }

    const favoritesCollection = collection(db, "users", userId, "favorites");
    const favSnapshot = await getDocs(favoritesCollection);

    if (favSnapshot.empty) {
      return NextResponse.json({ favorites: [] });
    }

    const albumsCollection = collection(db, "albums");

    const favorites = await Promise.all(
      favSnapshot.docs.map(async (favDoc) => {
        const {
          albumId,
          addedAt,
          labeledFeelings,
          activities,
          tags,
          format,
          ownership,
        } = favDoc.data();
        // Los favoritos anteriores podían tener un único formato como string.
        // La API siempre expone un array para que el cliente tenga un contrato único.
        const normalizedFormats = Array.isArray(format)
          ? format
          : format
            ? [format]
            : ownership?.type === "physical"
              ? Array.isArray(ownership.format)
                ? ownership.format
                : ownership.format
                  ? [ownership.format]
                  : []
              : ["digital"];

        const albumDoc = doc(albumsCollection, albumId);
        const albumSnap = await getDoc(albumDoc);

        return {
          id: favDoc.id,
          addedAt: addedAt?.toDate?.() ?? addedAt,
          savedAt: addedAt?.toDate?.() ?? addedAt,
          labeledFeelings: normalizeMoods(labeledFeelings ?? []),
          activities: activities ?? [],
          tags: Array.isArray(tags) ? tags : [],
          format: normalizedFormats,
          album: albumSnap.exists() ? albumSnap.data() : null,
        };
      }),
    );

    favorites.sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    );

    return NextResponse.json({ favorites });
  } catch (error: any) {
    console.error("Error obteniendo favoritos:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 },
    );
  }
}
