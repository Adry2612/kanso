import { NextRequest, NextResponse } from "next/server";
import { authenticate, isAuthFailure } from "@/lib/apiAuth";
import { reportApiError } from "@/lib/sentry";
import {
  CollectionApiError,
  listCollection,
  removeCollectionAlbum,
  saveCollectionAlbum,
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
    { error: "No se pudo completar la operación de colección" },
    { status: 500 },
  );
}

export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const collection = await listCollection(auth.uid);
    return NextResponse.json({ collection });
  } catch (error) {
    return handleError(error, "collection/list");
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  try {
    const body = await request.json().catch(() => ({}));
    const result = await saveCollectionAlbum(auth.uid, body);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "collection/save");
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authenticate(request);
  if (isAuthFailure(auth)) return auth;

  const albumId = new URL(request.url).searchParams.get("albumId");
  if (!albumId?.trim()) {
    return NextResponse.json({ error: "Álbum no válido" }, { status: 400 });
  }

  try {
    const result = await removeCollectionAlbum(auth.uid, {
      album: { id: albumId },
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error, "collection/remove");
  }
}
