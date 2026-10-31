"use client";

import { Loader2 } from "lucide-react";
import FriendAvatar from "@/components/FriendAvatar";
import { useTranslations } from "@/context/I18nContext";
import type { FriendRequestAction, FriendRequestEntry } from "@/types/friends";

type FriendRequestListProps = {
  requests: FriendRequestEntry[];
  direction: "incoming" | "outgoing";
  busyRequestId: string | null;
  busyAction: FriendRequestAction | null;
  emptyLabel: string;
  onRespond: (requestId: string, action: FriendRequestAction) => void;
};

/** Lista de solicitudes recibidas o enviadas, sin estado propio de flujo. */
export default function FriendRequestList({
  requests,
  direction,
  busyRequestId,
  busyAction,
  emptyLabel,
  onRespond,
}: FriendRequestListProps) {
  const t = useTranslations("friends");

  if (requests.length === 0) {
    return (
      <p className="kanso-empty mx-auto max-w-xl rounded-xl border border-dashed border-[var(--kanso-line)] p-4 text-sm text-[var(--kanso-muted)]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => {
        const isBusy = busyRequestId === request.id;

        return (
          <div
            key={request.id}
            className="flex flex-col gap-3 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/55 p-3.5 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <FriendAvatar
                displayName={request.person.displayName}
                photoURL={request.person.photoURL}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {request.person.displayName}
                </p>
                <p className="truncate text-xs text-[var(--kanso-muted)]">
                  {direction === "incoming"
                    ? t("incoming.from")
                    : t("outgoing.to")}
                </p>
              </div>
            </div>

            {direction === "incoming" ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRespond(request.id, "accept")}
                  className="rounded-lg bg-[var(--kanso-mint)] px-3 py-2 text-xs font-bold text-[var(--background)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy && busyAction === "accept"
                    ? t("incoming.accepting")
                    : t("incoming.accept")}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRespond(request.id, "reject")}
                  className="rounded-lg border border-[var(--kanso-line)] px-3 py-2 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-danger)]/50 hover:text-[var(--kanso-danger)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBusy && busyAction === "reject"
                    ? t("incoming.rejecting")
                    : t("incoming.reject")}
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--kanso-line)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[var(--kanso-muted)] sm:self-auto">
                <Loader2 className="h-3 w-3" aria-hidden="true" />
                {t("outgoing.pending")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
