import { getArtist } from "@/services/server/spotify";
import { reportApiError } from "@/lib/sentry";

export async function GET(request: Request) {
  const artistId = new URL(request.url).searchParams.get("id");

  if (!artistId) {
    return Response.json({ error: "Falta el id del artista" }, { status: 400 });
  }

  try {
    const artist = await getArtist(artistId);
    return Response.json(artist);
  } catch (error) {
    reportApiError(error, "getArtist");
    return Response.json(
      { error: "No se pudo obtener el artista" },
      { status: 500 },
    );
  }
}
