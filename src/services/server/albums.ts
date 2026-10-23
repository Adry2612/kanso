import "server-only";

import { getAlbum as getSpotifyAlbum } from "./spotify";
import type { SpotifyAlbum } from "@/types/album";

/** Punto único de lectura del detalle de álbum en el servidor. */
export async function getAlbum(albumId: string): Promise<SpotifyAlbum> {
  return (await getSpotifyAlbum(albumId)) as SpotifyAlbum;
}
