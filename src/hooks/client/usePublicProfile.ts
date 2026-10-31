"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPublicProfile, sendFriendRequest } from "@/services/client/friends";
import { applyFriendRequestResult } from "@/utils/friends";
import type { PublicProfileResponse } from "@/types/friends";

type Options = {
  actionError: string;
};

/**
 * Perfil público por código de amigo: carga, 404 y envío de solicitud con
 * actualización inmediata de la relación.
 */
export function usePublicProfile(code: string, { actionError }: Options) {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!code) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);
    setError(false);
    setSendError(null);

    getPublicProfile(code)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setProfile(null);
          setNotFound(true);
        } else {
          setProfile(data);
        }
      })
      .catch((loadFailure) => {
        if (!active) return;
        console.error("No se pudo cargar el perfil público:", loadFailure);
        setProfile(null);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, code, user?.isAnonymous, user?.uid]);

  const addFriend = useCallback(async () => {
    if (!user || user.isAnonymous) return;

    setSending(true);
    setSendError(null);
    try {
      const result = await sendFriendRequest(code);
      setProfile((current) =>
        current ? applyFriendRequestResult(current, result) : current,
      );
    } catch (sendFailure) {
      console.error("No se pudo enviar la solicitud:", sendFailure);
      setSendError(actionError);
      // La relación puede haber cambiado en otra pestaña: refrescarla sin
      // borrar el mensaje de error que acabamos de mostrar.
      void getPublicProfile(code)
        .then((fresh) => {
          if (fresh) setProfile(fresh);
        })
        .catch(() => {});
    } finally {
      setSending(false);
    }
  }, [actionError, code, user]);

  return {
    profile,
    loading,
    notFound,
    error,
    sending,
    actionError: sendError,
    addFriend,
  };
}
