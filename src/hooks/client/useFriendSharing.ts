"use client";

import { useCallback, useState } from "react";
import { updateSharing } from "@/services/client/friends";
import type { FriendProfile, FriendSharingSettings } from "@/types/friends";

type Options = {
  profile: FriendProfile | null;
  onSharingChange: (sharing: FriendSharingSettings) => void;
  errorMessage: string;
};

/**
 * Guardado optimista de las secciones de compartición: el interruptor
 * responde al instante y se revierte si la API rechaza el cambio.
 */
export function useFriendSharing({
  profile,
  onSharingChange,
  errorMessage,
}: Options) {
  const [busy, setBusy] = useState<keyof FriendSharingSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const changeSharing = useCallback(
    async (section: keyof FriendSharingSettings, value: boolean) => {
      if (!profile || busy) return;

      const previous = profile.sharing;
      onSharingChange({ ...previous, [section]: value });
      setBusy(section);
      setError(null);

      try {
        const saved = await updateSharing({ [section]: value });
        onSharingChange(saved);
      } catch (sharingFailure) {
        onSharingChange(previous);
        setError(
          sharingFailure instanceof Error
            ? sharingFailure.message
            : errorMessage,
        );
      } finally {
        setBusy(null);
      }
    },
    [busy, errorMessage, onSharingChange, profile],
  );

  return { sharingBusy: busy, sharingError: error, changeSharing };
}
