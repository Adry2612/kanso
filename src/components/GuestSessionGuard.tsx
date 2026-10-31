"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { hasGuestEntry } from "@/lib/guestSession";

const PRIVATE_ROUTES = [
  "/home",
  "/search",
  "/collection",
  "/recommendation",
  "/recomendationHistory",
  "/friends",
  "/settings",
  "/releases",
];

function isPrivateRoute(pathname: string): boolean {
  if (pathname === "/artists") return true;

  return PRIVATE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Una sesión anónima restaurada no debe entrar directamente en la app: la
 * bienvenida pide una elección explícita. Las fichas compartibles de álbum y
 * artista quedan fuera del guard.
 */
export default function GuestSessionGuard() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user?.isAnonymous) return;
    if (!isPrivateRoute(pathname)) return;
    if (hasGuestEntry()) return;

    router.replace("/");
  }, [loading, pathname, router, user]);

  return null;
}
