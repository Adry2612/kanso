import { NextRequest, NextResponse } from "next/server";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";
import {
  addListenLater,
  CollectionApiError,
  listListenLater,
  removeListenLater,
} from "@/services/server/collection";

function handleError(error: unknown, context: string) {
  if (error instanceof CollectionApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }

  reportApiError(error, context);
  return NextResponse.json(
    { error: "No se pudo completar la operación de pendientes" },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const albums = await listListenLater(auth.uid);
    return NextResponse.json({ albums });
  } catch (error) {
    return handleError(error, "listenLater/list");
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await addListenLater(auth.uid, body);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "listenLater/save");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await removeListenLater(auth.uid, body);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "listenLater/remove");
  }
}
