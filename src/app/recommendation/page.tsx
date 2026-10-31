"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import RecomendationPage from "../home/pages/RecomendationPage";
import { Suspense, useEffect, useState } from "react";

/**
 * Página de recomendaciones - Maneja ambos flujos en una misma ruta
 *
 * Flujo por MOOD:
 * GET /recommendation?moods=Alegría&moods=Energía&type=mood
 *
 * Flujo por ACTIVITY:
 * GET /recommendation?activity=party&type=activity
 */

function RecommendationReader() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Parámetros posibles
  const activity = searchParams.getAll("activity")[0] || null;
  const bracketedMoods = searchParams.getAll("moods[]");
  const moods = bracketedMoods.length
    ? bracketedMoods
    : searchParams.getAll("moods");
  const type = searchParams.get("type") || "mood"; // Por defecto "mood"
  const format = searchParams.get("format") || "all";
  const tags = searchParams.getAll("tag");
  const isQuick = searchParams.get("quick") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?mode=login");
    }
  }, [authLoading, user, router]);

  if (!mounted || authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="surface-raised rounded-[var(--radius-md)] px-6 py-4 text-sm text-[var(--kanso-mint)]">
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <RecomendationPage
      moods={moods}
      userId={user.uid}
      activity={type === "activity" ? activity : null}
      format={format}
      tags={tags}
      isQuick={isQuick}
    />
  );
}

export default function RecommendationPageRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="surface-raised rounded-[var(--radius-md)] px-6 py-4 text-sm text-[var(--kanso-mint)]">
            Cargando...
          </div>
        </div>
      }
    >
      <RecommendationReader />
    </Suspense>
  );
}
