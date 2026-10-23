import { searchArtists } from "@/services/server/spotify";
import { reportApiError } from "@/lib/sentry";

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get("q");

  if (!query) {
    return Response.json({ error: "Falta la consulta" }, { status: 400 });
  }

  try {
    const results = await searchArtists(query);
    return Response.json(results);
  } catch (error) {
    reportApiError(error, "searchArtists");
    return Response.json(
      { error: "No se pudo buscar artistas" },
      { status: 500 },
    );
  }
}
