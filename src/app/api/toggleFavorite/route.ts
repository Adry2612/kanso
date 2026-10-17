/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Album } from "../../../../models/album";
import { getArtist } from "@/services/spotify";
import { FavoriteFormat, FavoriteTag } from "@/types/favorites";
import { normalizeMoods } from "@/constants/moods";
/**
 * Función auxiliar para obtener token de Spotify
 */
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Spotify credentials (SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET)",
    );
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify access token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Obtiene características de audio del álbum
 */
async function getAlbumAudioFeatures(albumId: string) {
  try {
    console.log(`\n📀 === INICIANDO ANÁLISIS DE CARACTERÍSTICAS ===`);
    console.log(`📀 Album ID: ${albumId}`);

    const token = await getSpotifyToken();
    console.log(`✓ Token Spotify obtenido`);

    // Obtener pistas del álbum
    console.log(`🎵 Obteniendo pistas del álbum...`);
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!tracksRes.ok) {
      const errorText = await tracksRes.text();
      console.error(
        `❌ Error al obtener pistas: ${tracksRes.status} - ${errorText}`,
      );
      return null;
    }

    const tracksData = await tracksRes.json();
    console.log(
      `✓ Pistas obtenidas: ${tracksData.items?.length || 0} canciones`,
    );

    const trackIds = tracksData.items?.map((track: any) => track.id).join(",");

    if (!trackIds) {
      console.error(`❌ No hay IDs de pistas`);
      return null;
    }

    // Obtener audio features
    console.log(
      `🎼 Obteniendo audio features para ${trackIds.split(",").length} pistas...`,
    );
    const featuresRes = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!featuresRes.ok) {
      const errorText = await featuresRes.text();
      console.error(
        `❌ Error al obtener audio features: ${featuresRes.status} - ${errorText}`,
      );
      return null;
    }

    const featuresData = await featuresRes.json();
    const validFeatures = featuresData.audio_features?.filter(
      (f: any) => f !== null,
    );

    console.log(
      `✓ Audio features obtenidas: ${validFeatures?.length || 0} válidas`,
    );

    if (!validFeatures || validFeatures.length === 0) {
      console.error(`❌ No hay features válidas`);
      return null;
    }

    // Calcular promedios
    const result = {
      energy:
        validFeatures.reduce((sum: number, f: any) => sum + f.energy, 0) /
        validFeatures.length,
      valence:
        validFeatures.reduce((sum: number, f: any) => sum + f.valence, 0) /
        validFeatures.length,
      danceability:
        validFeatures.reduce((sum: number, f: any) => sum + f.danceability, 0) /
        validFeatures.length,
      acousticness:
        validFeatures.reduce((sum: number, f: any) => sum + f.acousticness, 0) /
        validFeatures.length,
      instrumentalness:
        validFeatures.reduce(
          (sum: number, f: any) => sum + f.instrumentalness,
          0,
        ) / validFeatures.length,
      tempo:
        validFeatures.reduce((sum: number, f: any) => sum + f.tempo, 0) /
        validFeatures.length,
      speechiness:
        validFeatures.reduce((sum: number, f: any) => sum + f.speechiness, 0) /
        validFeatures.length,
      totalTracks: validFeatures.length,
    };

    console.log(`✅ Características calculadas:`, result);
    console.log(`📀 === FIN ANÁLISIS ===\n`);
    return result;
  } catch (error) {
    console.error(`❌ Error en getAlbumAudioFeatures:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      album,
      userId,
      feelings,
      format = ["digital"],
      activities = [],
      tags = [],
    }: {
      album: Album;
      userId: string;
      feelings: Array<string>;
      format?: FavoriteFormat[];
      activities?: Array<string>;
      tags?: FavoriteTag[];
    } = await request.json();

    const normalizedFeelings = normalizeMoods(
      (feelings || []).map((feeling: any) =>
        typeof feeling === "string" ? feeling : feeling?.label,
      ),
    );

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

    const albumsCollection = collection(db, "albums");

    const favoritesCollection = collection(db, "users", userId, "favorites");

    const q = query(albumsCollection, where("id", "==", album.id));
    const res = await getDocs(q);

    let albumDocId: string;

    if (res.empty) {
      const docRef = await addDoc(albumsCollection, album);
      albumDocId = docRef.id;
    } else {
      albumDocId = res.docs[0].id;
    }

    const favoriteQuery = query(
      favoritesCollection,
      where("albumId", "==", albumDocId),
    );
    const favoriteRes = await getDocs(favoriteQuery);

    if (!favoriteRes.empty) {
      await setDoc(
        favoriteRes.docs[0].ref,
        {
          labeledFeelings: normalizedFeelings,
          activities,
          format: formats,
          tags: normalizedTags,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
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
    const favoriteDocRef = doc(db, "users", userId, "favorites", albumDocId);

    const mainArtist = await getArtist(album.artists[0].id);
    console.log("🚀 ~ POST ~ mainArtist:", mainArtist);

    // Nota: Extracting audio features requiere User Token de Spotify, no Client Credentials
    // Se obtendrán cuando sea necesario en el análisis de recomendaciones
    // const audioFeatures = await getAlbumAudioFeatures(album.id);

    await setDoc(favoriteDocRef, {
      albumId: albumDocId,
      labeledFeelings: normalizedFeelings,
      activities,
      format: formats,
      tags: normalizedTags,
      addedAt: serverTimestamp(),
    });

    return NextResponse.json({
      message: "Favorito guardado",
      feelings: normalizedFeelings,
      activities,
      format: formats,
      tags: normalizedTags,
    });
  } catch (error: any) {
    console.error("Error en toggleFavorite API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 },
    );
  }
}
