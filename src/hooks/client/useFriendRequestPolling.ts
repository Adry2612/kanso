"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFriendRequestNotifications } from "@/services/client/friends";
import type { FriendRequestEntry } from "@/types/friends";

const POLL_MS = 20_000;

type Options = {
  onNewRequests: (requests: FriendRequestEntry[]) => void;
};

/**
 * Consulta periódica de solicitudes de amistad nuevas.
 *
 * Firestore está cerrado al cliente, así que se consulta una ruta ligera de la
 * API. La primera lectura solo toma la línea base: no se avisa de las
 * solicitudes que ya estaban pendientes al abrir la aplicación.
 */
export function useFriendRequestPolling({ onNewRequests }: Options) {
  const { user, loading: authLoading } = useAuth();
  const onNewRequestsRef = useRef(onNewRequests);
  onNewRequestsRef.current = onNewRequests;

  useEffect(() => {
    if (authLoading) return;

    const uid = user?.uid;
    const isAnonymous = user?.isAnonymous === true;

    if (!uid || isAnonymous) {
      return;
    }

    const seenRequests = new Set<string>();
    let initialized = false;
    let inFlight = false;
    let active = true;

    const requestKey = (id: string, createdAt: string | null) =>
      `${id}:${createdAt ?? ""}`;

    const check = async () => {
      if (!active || inFlight) return;
      if (document.visibilityState === "hidden") return;

      inFlight = true;
      try {
        const incoming = await getFriendRequestNotifications();
        if (!active) return;

        if (!initialized) {
          incoming.forEach((request) =>
            seenRequests.add(requestKey(request.id, request.createdAt)),
          );
          initialized = true;
          return;
        }

        const fresh = incoming.filter(
          (request) =>
            !seenRequests.has(requestKey(request.id, request.createdAt)),
        );

        incoming.forEach((request) =>
          seenRequests.add(requestKey(request.id, request.createdAt)),
        );

        if (fresh.length > 0) onNewRequestsRef.current(fresh);
      } catch {
        // Una notificación no debe romper la navegación ni mostrar errores
        // técnicos; se reintenta en el siguiente ciclo o al volver a la pestaña.
      } finally {
        inFlight = false;
      }
    };

    void check();

    const interval = window.setInterval(() => {
      void check();
    }, POLL_MS);

    const handleFocus = () => {
      void check();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void check();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [authLoading, user?.isAnonymous, user?.uid]);
}
