const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// Caché del token de aplicación: uno por instancia y por ventana de validez.
let cachedToken: { value: string; expiresAt: number } | null = null;
let tokenRequest: Promise<string> | null = null;

async function requestAccessToken(): Promise<string> {
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Spotify token error:", response.status, errorText);
    throw new Error(
      `Failed to get Spotify access token: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("No access token in Spotify response");
  }

  const ttlMs = (Number(data.expires_in) || 3600) * 1000;
  cachedToken = {
    value: data.access_token,
    // Margen de 60 s antes de la caducidad real, con un mínimo de seguridad.
    expiresAt: Date.now() + Math.max(ttlMs - 60_000, 30_000),
  };

  return data.access_token;
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  // Deduplica ráfagas concurrentes: todas esperan a la misma petición.
  if (!tokenRequest) {
    tokenRequest = requestAccessToken().finally(() => {
      tokenRequest = null;
    });
  }

  return tokenRequest;
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

export async function searchArtists(query: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=12`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return res.json();
}

/**
 * Discografía de un artista: solo álbumes y EPs.
 * Spotify agrupa los EPs bajo `single`, así que se pide `album,single` y se
 * conserva un single solo si tiene 3 o más pistas (heurística de EP).
 * Se excluyen compilaciones y apariciones en trabajos de otros.
 */
export async function getArtistAlbums(id: string) {
  const token = await getAccessToken();
  const limit = 50;
  const items: any[] = [];

  for (let page = 0; page < 4; page += 1) {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=${limit}&offset=${page * limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      if (page === 0) {
        throw new Error(`Spotify API error: ${res.status}`);
      }
      break;
    }

    const data = await res.json();
    items.push(...(data.items || []));
    if (!data.next) break;
  }

  const seen = new Set<string>();
  return items
    .filter((album: any) => {
      if (!album?.id || seen.has(album.id)) return false;
      seen.add(album.id);
      if (album.album_group === "appears_on") return false;
      if (album.album_type === "compilation") return false;
      if (album.album_type === "album") return true;
      if (album.album_type === "single") {
        return (album.total_tracks ?? 0) >= 3;
      }
      return false;
    })
    .sort((a: any, b: any) => (a.release_date < b.release_date ? 1 : -1));
}

/**
 * Novedades de un artista: álbumes, EPs y singles publicados en los últimos
 * `withinDays` días. A diferencia de la discografía, aquí sí se incluyen los
 * singles (un single nuevo es noticia). Excluye compilaciones y apariciones en
 * trabajos de otros, y descarta los lanzamientos sin precisión de mes/día.
 */
export async function getArtistReleases(id: string, withinDays = 60) {
  const token = await getAccessToken();
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;

  const res = await fetch(
    `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=50`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  const data = await res.json();
  const seen = new Set<string>();

  return (data.items || [])
    .filter((album: any) => {
      if (!album?.id || seen.has(album.id)) return false;
      seen.add(album.id);
      if (album.album_group === "appears_on") return false;
      if (album.album_type === "compilation") return false;
      if (album.album_type !== "album" && album.album_type !== "single") {
        return false;
      }
      if (album.release_date_precision === "year") return false;
      const releasedAt = new Date(album.release_date).getTime();
      if (Number.isNaN(releasedAt) || releasedAt < cutoff) return false;
      return true;
    })
    .map((album: any) => ({
      id: album.id,
      name: album.name,
      images: album.images ?? [],
      artists: (album.artists ?? []).map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })),
      releaseDate: album.release_date,
      albumType: album.album_type,
      totalTracks: album.total_tracks ?? 0,
    }))
    .sort((a: any, b: any) => (a.releaseDate < b.releaseDate ? 1 : -1));
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
