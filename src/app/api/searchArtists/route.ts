import { searchArtists } from "../../../../services/spotify";

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Falta la consulta" }, { status: 400 });
  }

  try {
    const results = await searchArtists(query);
    return Response.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al buscar artistas";
    return Response.json({ error: message }, { status: 500 });
  }
}
