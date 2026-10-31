import { NextResponse } from "next/server";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";
import {
  RecommendationApiError,
  saveRecommendationHistory,
} from "@/services/server/recommendations";

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await saveRecommendationHistory(auth.uid, body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RecommendationApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "saveRecomendationHistory");
    return NextResponse.json(
      { error: "No se pudo guardar la recomendación" },
      { status: 500 },
    );
  }
}
