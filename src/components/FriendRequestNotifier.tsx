"use client";

import { useCallback } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { UserPlus } from "lucide-react";
import { useTranslations } from "@/context/I18nContext";
import { useToast } from "@/components/ToastProvider";
import { useFriendRequestPolling } from "@/hooks/client/useFriendRequestPolling";
import type { FriendRequestEntry } from "@/types/friends";

/**
 * Avisa en la app cuando llega una solicitud de amistad nueva.
 *
 * El sondeo vive en `useFriendRequestPolling`; aquí solo se compone el aviso.
 */
export default function FriendRequestNotifier() {
  const { showToast } = useToast();
  const router = useTransitionRouter();
  const t = useTranslations("friends");

  const handleNewRequests = useCallback(
    (fresh: FriendRequestEntry[]) => {
      const name = fresh[0].person.displayName;
      const description =
        fresh.length === 1
          ? t("notifications.single").replace("{name}", name)
          : t("notifications.multiple").replace(
              "{count}",
              String(fresh.length),
            );

      showToast({
        title:
          fresh.length === 1
            ? t("notifications.title")
            : t("notifications.titleMultiple"),
        description,
        icon: <UserPlus className="h-4 w-4" aria-hidden="true" />,
        action: {
          label: t("notifications.view"),
          onClick: () => router.push("/friends"),
        },
      });
    },
    [router, showToast, t],
  );

  useFriendRequestPolling({ onNewRequests: handleNewRequests });

  return null;
}
