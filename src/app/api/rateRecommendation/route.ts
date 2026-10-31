import { NextResponse } from "next/server";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";
import {
  getRecommendationFeedback,
  rateRecommendation,
  RecommendationApiError,
} from "@/services/server/recommendations";

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await rateRecommendation(auth.uid, body);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof RecommendationApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "rateRecommendation");
    return NextResponse.json(
      { error: "No se pudo guardar la valoración" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const albumId = new URL(request.url).searchParams.get("albumId");
    const feedback = await getRecommendationFeedback(auth.uid, albumId);
    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof RecommendationApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    reportApiError(error, "getRecommendationFeedback");
    return NextResponse.json(
      { error: "No se pudo obtener la valoración" },
      { status: 500 },
    );
  }
}
