"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getFriends,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
} from "@/services/client/friends";
import { isValidFriendCode, normalizeFriendCode } from "@/utils/friends";
import type {
  FriendRequestAction,
  FriendSharingSettings,
  FriendsResponse,
} from "@/types/friends";

export type FriendsPageMessages = {
  invalidCode: string;
  addSent: string;
  addAccepted: string;
  addError: string;
  requestError: string;
  removeError: string;
};

/**
 * Estado y acciones de la pantalla de amigos: carga, alta por código,
 * respuesta a solicitudes y baja de un amigo. La vista solo compone.
 */
export function useFriendsPage(messages: FriendsPageMessages) {
  const { user, loading: authLoading } = useAuth();
  const {
    invalidCode,
    addSent,
    addAccepted,
    addError,
    requestError,
    removeError: removeErrorMessage,
  } = messages;

  const [data, setData] = useState<FriendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<FriendRequestAction | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmRemoveUid, setConfirmRemoveUid] = useState<string | null>(null);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getFriends());
    } catch (loadFailure) {
      setError(
        loadFailure instanceof Error
          ? loadFailure.message
          : "No pudimos cargar tus amigos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.isAnonymous) {
      setLoading(false);
      setData(null);
      return;
    }

    void loadFriends();
  }, [authLoading, user, loadFriends]);

  const addFriend = useCallback(async () => {
    setFormError(null);
    setFormSuccess(null);

    const normalized = normalizeFriendCode(code);
    if (!isValidFriendCode(normalized)) {
      setFormError(invalidCode);
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendFriendRequest(normalized);
      setFormSuccess(result.status === "accepted" ? addAccepted : addSent);
      setCode("");
      await loadFriends();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : addError,
      );
    } finally {
      setSubmitting(false);
    }
  }, [addAccepted, addError, addSent, code, invalidCode, loadFriends]);

  const respondToRequest = useCallback(
    async (requestId: string, action: FriendRequestAction) => {
      setBusyRequestId(requestId);
      setBusyAction(action);
      setActionError(null);
      try {
        await respondToFriendRequest(requestId, action);
        await loadFriends();
      } catch (requestFailure) {
        setActionError(
          requestFailure instanceof Error
            ? requestFailure.message
            : requestError,
        );
      } finally {
        setBusyRequestId(null);
        setBusyAction(null);
      }
    },
    [loadFriends, requestError],
  );

  const askRemoveFriend = useCallback((friendUid: string) => {
    setRemoveError(null);
    setConfirmRemoveUid(friendUid);
  }, []);

  const cancelRemoveFriend = useCallback(() => {
    setConfirmRemoveUid(null);
  }, []);

  const confirmRemoveFriend = useCallback(async () => {
    if (!confirmRemoveUid) return;

    const friendUid = confirmRemoveUid;
    setRemovingUid(friendUid);
    setRemoveError(null);
    try {
      await removeFriend(friendUid);
      setConfirmRemoveUid(null);
      await loadFriends();
    } catch (removeFailure) {
      setRemoveError(
        removeFailure instanceof Error
          ? removeFailure.message
          : removeErrorMessage,
      );
    } finally {
      setRemovingUid(null);
    }
  }, [confirmRemoveUid, loadFriends, removeErrorMessage]);

  /** Actualiza el perfil tras un parche optimista o la respuesta del API. */
  const applySharing = useCallback((sharing: FriendSharingSettings) => {
    setData((current) =>
      current
        ? { ...current, profile: { ...current.profile, sharing } }
        : current,
    );
  }, []);

  const openShare = useCallback(() => setShareOpen(true), []);
  const closeShare = useCallback(() => setShareOpen(false), []);

  return {
    data,
    loading,
    error,
    shareOpen,
    openShare,
    closeShare,
    code,
    setCode,
    submitting,
    formError,
    formSuccess,
    busyRequestId,
    busyAction,
    actionError,
    confirmRemoveUid,
    removingUid,
    removeError,
    loadFriends,
    addFriend,
    respondToRequest,
    askRemoveFriend,
    cancelRemoveFriend,
    confirmRemoveFriend,
    applySharing,
  };
}
