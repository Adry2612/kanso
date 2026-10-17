import { getArtist } from "../../../../services/spotify";

export async function GET(request: Request) {
  const artistId = new URL(request.url).searchParams.get("id");

  if (!artistId) {
    return Response.json({ error: "Falta el id del artista" }, { status: 400 });
  }

  try {
    const artist = await getArtist(artistId);
    return Response.json(artist);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener el artista";
    return Response.json({ error: message }, { status: 500 });
  }
}
