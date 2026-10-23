import { getArtistAlbums } from "@/services/server/spotify";
import { reportApiError } from "@/lib/sentry";

export async function GET(request: Request): Promise<Response> {
  const artistId = new URL(request.url).searchParams.get("id");

  if (!artistId) {
    return Response.json({ error: "Falta el id del artista" }, { status: 400 });
  }

  try {
    const albums = await getArtistAlbums(artistId);
    return Response.json({ albums });
  } catch (error) {
    reportApiError(error, "getArtistAlbums");
    return Response.json(
      { error: "No se pudo obtener la discografía" },
      { status: 500 },
    );
  }
}
