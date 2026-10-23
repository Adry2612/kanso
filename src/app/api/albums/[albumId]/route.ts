import { NextResponse } from "next/server";
import { getAlbum } from "@/services/server/albums";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ albumId: string }> },
) {
  const { albumId } = await params;

  if (!albumId) {
    return NextResponse.json({ error: "Missing album id" }, { status: 400 });
  }

  try {
    const album = await getAlbum(albumId);

    if (!album || typeof album !== "object" || "error" in album) {
      return NextResponse.json(
        { error: "No se pudo cargar el álbum" },
        { status: 502 },
      );
    }

    return NextResponse.json(album);
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar el álbum" },
      { status: 500 },
    );
  }
}
