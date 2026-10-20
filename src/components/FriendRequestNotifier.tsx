"use client";

import { useEffect, useRef } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import { useToast } from "@/components/ToastProvider";
import { getFriendRequestNotifications } from "@/lib/api/friends";

const POLL_MS = 20_000;

/**
 * Avisa en la app cuando llega una solicitud de amistad nueva.
 *
 * Firestore está cerrado al cliente, así que se consulta una ruta ligera de la
 * API. La primera lectura solo toma la línea base: no queremos avisar de las
 * solicitudes que ya estaban pendientes al abrir la aplicación.
 */
export default function FriendRequestNotifier() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useTransitionRouter();
  const t = useTranslations("friends");

  // El efecto no debe reiniciarse cada vez que un proveedor se renderiza:
  // guardamos las funciones y la traducción actuales en referencias.
  const tRef = useRef(t);
  const showToastRef = useRef(showToast);
  const routerRef = useRef(router);
  tRef.current = t;
  showToastRef.current = showToast;
  routerRef.current = router;

  const seenRequests = useRef(new Set<string>());
  const initialized = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    const uid = user?.uid;
    const isAnonymous = user?.isAnonymous === true;

    if (!uid || isAnonymous) {
      seenRequests.current.clear();
      initialized.current = false;
      inFlight.current = false;
      return;
    }

    seenRequests.current.clear();
    initialized.current = false;
    inFlight.current = false;

    let active = true;

    const requestKey = (id: string, createdAt: string | null) =>
      `${id}:${createdAt ?? ""}`;

    const check = async () => {
      if (!active || inFlight.current) return;
      if (document.visibilityState === "hidden") return;

      inFlight.current = true;
      try {
        const incoming = await getFriendRequestNotifications();
        if (!active) return;

        if (!initialized.current) {
          incoming.forEach((request) =>
            seenRequests.current.add(requestKey(request.id, request.createdAt)),
          );
          initialized.current = true;
          return;
        }

        const fresh = incoming.filter(
          (request) =>
            !seenRequests.current.has(
              requestKey(request.id, request.createdAt),
            ),
        );

        incoming.forEach((request) =>
          seenRequests.current.add(requestKey(request.id, request.createdAt)),
        );

        if (fresh.length === 0) return;

        const name = fresh[0].person.displayName;
        const description =
          fresh.length === 1
            ? tRef.current("notifications.single").replace("{name}", name)
            : tRef
                .current("notifications.multiple")
                .replace("{count}", String(fresh.length));

        showToastRef.current({
          title:
            fresh.length === 1
              ? tRef.current("notifications.title")
              : tRef.current("notifications.titleMultiple"),
          description,
          icon: <UserPlus className="h-4 w-4" aria-hidden="true" />,
          action: {
            label: tRef.current("notifications.view"),
            onClick: () => routerRef.current.push("/friends"),
          },
        });
      } catch {
        // Una notificación no debe romper la navegación ni mostrar errores
        // técnicos; se reintenta en el siguiente ciclo o al volver a la pestaña.
      } finally {
        inFlight.current = false;
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
  }, [authLoading, user?.uid, user?.isAnonymous]);

  return null;
}
