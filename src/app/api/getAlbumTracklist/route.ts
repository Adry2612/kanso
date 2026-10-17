import { NextResponse } from "next/server";
import { getAlbumTracklist } from "@/services/spotify";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { SpotifyArtist, SpotifyTrack } from "@/types/spotify";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const firebaseId = url.searchParams.get("id");

    if (!firebaseId) {
      return NextResponse.json(
        { error: 'Missing album id (query param "id")' },
        { status: 400 },
      );
    }

    const albumRef = doc(db, "albums", firebaseId);
    const albumSnap = await getDoc(albumRef);
    if (!albumSnap.exists()) {
      return NextResponse.json(
        { error: "Album not found in database" },
        { status: 404 },
      );
    }
    const albumData = albumSnap.data();
    const spotifyId = albumData?.albumInfo?.id || albumData?.id;
    if (!spotifyId) {
      return NextResponse.json(
        { error: "Spotify ID not found in album data" },
        { status: 400 },
      );
    }

    const data = await getAlbumTracklist(spotifyId);
    if (!data || !data.items) {
      return NextResponse.json({ error: "No tracks found" }, { status: 404 });
    }

    const tracks = (data.items as SpotifyTrack[]).map(
      (track: SpotifyTrack) => ({
        name: track.name,
        track_number: track.track_number,
        artists: track.artists.map((artist: SpotifyArtist) => ({
          name: artist.name,
          id: artist.id,
        })),
      }),
    );

    return NextResponse.json(tracks);
  } catch (err) {
    console.error("Error in getAlbumTracklist route:", err);
    return NextResponse.json(
      {
        error: "Server error",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
