import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, albumId, moods } = body;

    if (!userId || !albumId) {
      return NextResponse.json(
        { error: "Missing required fields: userId and albumId" },
        { status: 400 },
      );
    }

    const recommendationData = {
      albumId,
      moods: moods || [],
      providedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "users", userId, "recomendationHistory"),
      recommendationData,
    );

    return NextResponse.json({
      success: true,
      recommendationId: docRef.id,
    });
  } catch (error) {
    console.error("Error saving recommendation:", error);
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 },
    );
  }
}
