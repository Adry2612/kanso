const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

async function getAccessToken() {
  console.log("🔐 Getting Spotify access token...");
  console.log("📋 Client ID:", client_id ? "Present" : "MISSING");
  console.log("🔑 Client Secret:", client_secret ? "Present" : "MISSING");

  if (!client_id || !client_secret) {
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
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });

  console.log("🎫 Token response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Token error:", errorText);
    throw new Error(
      `Failed to get Spotify access token: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("No access token in Spotify response");
  }

  console.log("✅ Access token obtained successfully");
  return data.access_token;
}

export async function getArtist(id: string) {
  const token = await getAccessToken();
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const artistData = await res.json();

  return artistData;
}

export async function getAlbum(id: string) {
  const token = await getAccessToken();

  const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const albumData = await res.json();

  return albumData;
}

export async function searchStuff(query: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,artist&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.json();
}

export async function getAlbumTracklist(albumId: string) {
  const token = await getAccessToken();

  const url = `https://api.spotify.com/v1/albums/${albumId}/tracks`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("📊 Response status:", res.status);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("❌ Spotify API error response:", errorBody);
    throw new Error(`Spotify API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

/**
 * Obtiene las características de audio promedio de todas las canciones de un álbum
 */
export async function getAlbumAudioFeaturesAverage(albumId: string) {
  try {
    console.log(
      `📀 Obteniendo características de audio para álbum: ${albumId}`,
    );
    const token = await getAccessToken();

    // Obtener pistas del álbum
    console.log(`🎵 Solicitando pistas del álbum...`);
    const tracksRes = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!tracksRes.ok) {
      const errorText = await tracksRes.text();
      console.error(
        `❌ Error obteniendo pistas del álbum ${albumId}: ${tracksRes.status} - ${errorText}`,
      );
      return null;
    }

    const tracksData = await tracksRes.json();
    console.log(
      `✓ Pistas obtenidas: ${tracksData.items?.length || 0} canciones`,
    );

    const trackIds = tracksData.items?.map((track: any) => track.id).join(",");

    if (!trackIds) {
      console.error(
        `❌ No se encontraron IDs de pistas para el álbum ${albumId}`,
      );
      return null;
    }

    // Obtener audio features de todas las pistas
    console.log(
      `🎼 Solicitando audio features para ${trackIds.split(",").length} pistas...`,
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
        `❌ Error obteniendo audio features del álbum ${albumId}: ${featuresRes.status} - ${errorText}`,
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
      console.error(
        `❌ No se obtuvieron características válidas para el álbum ${albumId}`,
      );
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
    return result;
  } catch (error) {
    console.error(`❌ Error analizando álbum ${albumId}:`, error);
    return null;
  }
}
