// app/api/search/route.ts

import { searchStuff } from "@/services/server/spotify";
import { reportApiError } from "@/lib/sentry";

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing query parameter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const results = await searchStuff(query);

    // Si la respuesta no es un resultado válido de Spotify (p. ej. un límite de
    // peticiones), devolver error para que la UI no lo pinte como "sin resultados".
    if (!results?.albums && !results?.artists) {
      return new Response(
        JSON.stringify({
          error:
            "La búsqueda no está disponible ahora mismo. Inténtalo de nuevo.",
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    reportApiError(error, "search");
    return new Response(
      JSON.stringify({ error: "No se pudo completar la búsqueda" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
