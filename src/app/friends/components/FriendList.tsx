"use client";

import { Link } from "next-view-transitions";
import { Share2, UsersRound } from "lucide-react";
import FriendAvatar from "@/components/FriendAvatar";
import { useTranslations } from "@/context/I18nContext";
import type { FriendEntry } from "@/types/friends";

type FriendListProps = {
  friends: FriendEntry[];
  confirmRemoveUid: string | null;
  removingUid: string | null;
  onAskRemove: (uid: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: () => void;
  onShare: () => void;
};

/** Lista de amigos con confirmación de baja, sin estado propio de flujo. */
export default function FriendList({
  friends,
  confirmRemoveUid,
  removingUid,
  onAskRemove,
  onCancelRemove,
  onConfirmRemove,
  onShare,
}: FriendListProps) {
  const t = useTranslations("friends");

  if (friends.length === 0) {
    return (
      <div className="mt-5 rounded-xl border border-dashed border-[var(--kanso-line)] p-6 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-mint)]">
          <UsersRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">
          {t("list.emptyTitle")}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
          {t("list.emptyDescription")}
        </p>
        <button
          type="button"
          onClick={onShare}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {t("list.emptyCta")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {friends.map((friend) => {
        const isConfirming = confirmRemoveUid === friend.uid;
        const isRemoving = removingUid === friend.uid;

        return (
          <div
            key={friend.uid}
            className="flex flex-col gap-3 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/55 p-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <FriendAvatar
                displayName={friend.displayName}
                photoURL={friend.photoURL}
                size="sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                  {friend.displayName}
                </p>
                <p className="text-xs text-[var(--kanso-muted)]">
                  {t("list.friendLabel")}
                </p>
              </div>
            </div>

            {isConfirming ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--kanso-muted)]">
                  {t("list.removeConfirm").replace(
                    "{name}",
                    friend.displayName,
                  )}
                </span>
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={onConfirmRemove}
                  className="rounded-lg bg-[var(--kanso-danger)]/15 px-3 py-2 text-xs font-bold text-[var(--kanso-danger)] transition hover:bg-[var(--kanso-danger)]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRemoving ? t("list.removing") : t("list.confirmRemove")}
                </button>
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={onCancelRemove}
                  className="rounded-lg border border-[var(--kanso-line)] px-3 py-2 text-xs font-semibold text-[var(--kanso-muted)] transition hover:text-[var(--foreground)] disabled:opacity-60"
                >
                  {t("list.cancel")}
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <Link
                  href={`/friends/${friend.uid}`}
                  className="rounded-lg border border-[var(--kanso-line)] px-3 py-2 text-xs font-semibold text-[var(--kanso-mint)] transition hover:border-[var(--kanso-mint)]/60 hover:bg-[var(--kanso-mint)]/10"
                >
                  {t("list.viewProfile")}
                </Link>
                <button
                  type="button"
                  onClick={() => onAskRemove(friend.uid)}
                  className="rounded-lg border border-[var(--kanso-line)] px-3 py-2 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-danger)]/50 hover:text-[var(--kanso-danger)]"
                >
                  {t("list.remove")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
