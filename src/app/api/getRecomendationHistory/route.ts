import { NextResponse } from "next/server";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";
import {
  listRecommendationHistory,
  RecommendationApiError,
} from "@/services/server/recommendations";

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const result = await listRecommendationHistory(auth.uid);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof RecommendationApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "getRecomendationHistory");
    return NextResponse.json(
      { error: "Error al obtener el historial" },
      { status: 500 },
    );
  }
}
