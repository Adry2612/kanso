import { getArtistAlbums } from "../../../../services/spotify";

export async function GET(request: Request): Promise<Response> {
  const artistId = new URL(request.url).searchParams.get("id");

  if (!artistId) {
    return Response.json({ error: "Falta el id del artista" }, { status: 400 });
  }

  try {
    const albums = await getArtistAlbums(artistId);
    return Response.json({ albums });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al obtener la discografía";
    return Response.json({ error: message }, { status: 500 });
  }
}
