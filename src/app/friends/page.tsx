"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "next-view-transitions";
import {
  Inbox,
  Loader2,
  Send,
  Share2,
  ShieldCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import { Reveal } from "@/components/motion";
import { Skeleton } from "@/components/Skeleton";
import FriendAvatar from "@/components/FriendAvatar";
import FriendShareModal from "@/components/FriendShareModal";
import ErrorState from "@/components/ErrorState";
import {
  getFriends,
  removeFriend,
  respondToFriendRequest,
  sendFriendRequest,
  updateSharing,
} from "@/lib/api/friends";
import type {
  FriendEntry,
  FriendRequestEntry,
  FriendsResponse,
  FriendSharingSettings,
} from "@/types/friends";

function loginHref(mode: "login" | "register") {
  return `/login?mode=${mode}&next=${encodeURIComponent("/friends")}`;
}

const SHARING_SECTIONS: (keyof FriendSharingSettings)[] = [
  "recommendations",
  "collection",
  "artists",
];

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("friends");

  const [data, setData] = useState<FriendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"accept" | "reject" | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const [confirmRemoveUid, setConfirmRemoveUid] = useState<string | null>(null);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const [sharingBusy, setSharingBusy] = useState<
    keyof FriendSharingSettings | null
  >(null);
  const [sharingError, setSharingError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await getFriends());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
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

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const normalized = code.replace(/[\s-]/g, "").toUpperCase();
    if (normalized.length !== 8) {
      setFormError(t("add.invalidCode"));
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendFriendRequest(normalized);
      setFormSuccess(
        result.status === "accepted" ? t("add.accepted") : t("add.sent"),
      );
      setCode("");
      await loadFriends();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("add.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequest = async (
    requestId: string,
    action: "accept" | "reject",
  ) => {
    setBusyRequestId(requestId);
    setBusyAction(action);
    setActionError(null);
    try {
      await respondToFriendRequest(requestId, action);
      await loadFriends();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t("actionError"));
    } finally {
      setBusyRequestId(null);
      setBusyAction(null);
    }
  };

  const handleRemove = async (friendUid: string) => {
    setRemovingUid(friendUid);
    setRemoveError(null);
    try {
      await removeFriend(friendUid);
      setConfirmRemoveUid(null);
      await loadFriends();
    } catch (error) {
      setRemoveError(
        error instanceof Error ? error.message : t("list.removeError"),
      );
    } finally {
      setRemovingUid(null);
    }
  };

  const handleSharingChange = async (
    section: keyof FriendSharingSettings,
    value: boolean,
  ) => {
    if (!data || sharingBusy) return;

    const previous = data.profile.sharing;
    const next = { ...previous, [section]: value };

    // Guardado optimista: el interruptor responde al instante y se revierte
    // si la API rechaza el cambio.
    setData({ ...data, profile: { ...data.profile, sharing: next } });
    setSharingBusy(section);
    setSharingError(null);

    try {
      const saved = await updateSharing({ [section]: value });
      setData((current) =>
        current
          ? { ...current, profile: { ...current.profile, sharing: saved } }
          : current,
      );
    } catch (error) {
      setData((current) =>
        current
          ? { ...current, profile: { ...current.profile, sharing: previous } }
          : current,
      );
      setSharingError(
        error instanceof Error ? error.message : t("privacy.error"),
      );
    } finally {
      setSharingBusy(null);
    }
  };

  const renderRequest = (
    request: FriendRequestEntry,
    direction: "incoming" | "outgoing",
  ) => {
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
              {direction === "incoming" ? t("incoming.from") : t("outgoing.to")}
            </p>
          </div>
        </div>

        {direction === "incoming" ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleRequest(request.id, "accept")}
              className="rounded-lg bg-[var(--kanso-mint)] px-3 py-2 text-xs font-bold text-[var(--background)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy && busyAction === "accept"
                ? t("incoming.accepting")
                : t("incoming.accept")}
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleRequest(request.id, "reject")}
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
  };

  const renderFriend = (friend: FriendEntry) => {
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
              {t("list.removeConfirm").replace("{name}", friend.displayName)}
            </span>
            <button
              type="button"
              disabled={isRemoving}
              onClick={() => handleRemove(friend.uid)}
              className="rounded-lg bg-[var(--kanso-danger)]/15 px-3 py-2 text-xs font-bold text-[var(--kanso-danger)] transition hover:bg-[var(--kanso-danger)]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRemoving ? t("list.removing") : t("list.confirmRemove")}
            </button>
            <button
              type="button"
              disabled={isRemoving}
              onClick={() => setConfirmRemoveUid(null)}
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
              onClick={() => {
                setRemoveError(null);
                setConfirmRemoveUid(friend.uid);
              }}
              className="rounded-lg border border-[var(--kanso-line)] px-3 py-2 text-xs font-semibold text-[var(--kanso-muted)] transition hover:border-[var(--kanso-danger)]/50 hover:text-[var(--kanso-danger)]"
            >
              {t("list.remove")}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (authLoading || (loading && !data)) {
    return (
      <main className="kanso-main min-h-screen">
        <div className="max-w-3xl">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-12 w-56 max-w-full" />
          <Skeleton className="mt-5 h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="mt-10 h-44 w-full max-w-3xl rounded-2xl" />
        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
        <Skeleton className="mt-7 h-64 rounded-2xl" />
      </main>
    );
  }

  if (!user || user.isAnonymous) {
    const isGuest = Boolean(user?.isAnonymous);

    return (
      <main className="kanso-main min-h-screen">
        <Reveal>
          <section className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              {t("eyebrow")}
            </p>
            <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
              {t("subtitle")}
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="kanso-panel mt-10 max-w-3xl p-6 md:p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-mint)]">
              <UsersRound className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
              {isGuest ? t("guest.eyebrow") : t("eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {isGuest ? t("guest.title") : t("noSession.title")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
              {isGuest ? t("guest.description") : t("noSession.description")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={loginHref("register")}
                className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
              >
                {isGuest
                  ? t("guest.createAccount")
                  : t("noSession.createAccount")}
              </Link>
              <Link
                href={loginHref("login")}
                className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
              >
                {isGuest ? t("guest.signIn") : t("noSession.signIn")}
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="kanso-main min-h-screen">
        <section className="max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
            {t("eyebrow")}
          </p>
          <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
            {t("title")}
          </h1>
        </section>
        <ErrorState
          className="mt-10"
          title={t("loadError")}
          description={loadError ?? t("loadErrorDescription")}
          onRetry={() => void loadFriends()}
          retryLabel={t("retry")}
        />
      </main>
    );
  }

  return (
    <main className="kanso-main min-h-screen">
      <Reveal>
        <section className="flex max-w-5xl flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
              {t("eyebrow")}
            </p>
            <h1 className="kanso-page-title !mt-3 !text-5xl md:!text-6xl">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[var(--kanso-muted)]">
              {t("subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105 md:self-auto"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {t("shareProfile")}
          </button>
        </section>
      </Reveal>

      {loadError && (
        <ErrorState
          variant="inline"
          className="mt-5 max-w-5xl"
          title={t("loadError")}
          description={loadError}
          onRetry={() => void loadFriends()}
          retryLabel={t("retry")}
        />
      )}

      <Reveal delay={0.05}>
        <section className="kanso-panel mt-8 max-w-5xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <FriendAvatar
              displayName={data.profile.displayName}
              photoURL={data.profile.photoURL}
              size="lg"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--kanso-mint)]">
                {t("eyebrow")}
              </p>
              <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {data.profile.displayName}
              </h2>
              <p className="mt-1 font-mono text-sm tracking-[.18em] text-[var(--kanso-muted)]">
                {data.profile.friendCode}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAdd}
            className="mt-7 border-t border-[var(--kanso-line)] pt-6"
          >
            <div className="flex items-center gap-2">
              <UserPlus
                className="h-4 w-4 text-[var(--kanso-mint)]"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {t("add.title")}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--kanso-muted)]">
              {t("add.description")}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="friend-code"
                  className="mb-1.5 block text-xs font-semibold text-[var(--kanso-muted)]"
                >
                  {t("add.label")}
                </label>
                <input
                  id="friend-code"
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder={t("add.placeholder")}
                  maxLength={12}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  className="kanso-input w-full px-4 py-3 font-mono text-sm uppercase tracking-[.16em] placeholder:tracking-normal placeholder:text-[var(--kanso-muted)]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-5 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {submitting ? t("add.submitting") : t("add.submit")}
              </button>
            </div>
            {formError && (
              <p
                role="alert"
                className="mt-3 text-sm text-[var(--kanso-danger)]"
              >
                {formError}
              </p>
            )}
            {formSuccess && (
              <p
                role="status"
                className="mt-3 text-sm text-[var(--kanso-mint)]"
              >
                {formSuccess}
              </p>
            )}
          </form>
        </section>
      </Reveal>

      <Reveal delay={0.07}>
        <section
          className="kanso-panel mt-7 max-w-5xl p-6 md:p-8"
          aria-labelledby="sharing-title"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-[var(--kanso-mint)]"
              aria-hidden="true"
            />
            <h2
              id="sharing-title"
              className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
            >
              {t("privacy.title")}
            </h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("privacy.description")}
          </p>

          {sharingError && (
            <ErrorState
              variant="inline"
              className="mt-3 max-w-2xl"
              title={sharingError}
            />
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {SHARING_SECTIONS.map((section) => {
              const enabled = data.profile.sharing[section];
              const title = t(`privacy.sections.${section}.title`);

              return (
                <div
                  key={section}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/55 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--kanso-muted)]">
                      {t(`privacy.sections.${section}.description`)}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={title}
                    disabled={sharingBusy !== null}
                    onClick={() => void handleSharingChange(section, !enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kanso-mint)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-wait disabled:opacity-60 ${
                      enabled
                        ? "border-[var(--kanso-mint)] bg-[var(--kanso-mint)]"
                        : "border-[var(--kanso-line)] bg-[var(--surface-2)]"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-[var(--background)] transition ${
                        enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {sharingBusy && (
            <p role="status" className="mt-3 text-xs text-[var(--kanso-muted)]">
              {t("privacy.saving")}
            </p>
          )}
        </section>
      </Reveal>

      {actionError && (
        <ErrorState
          variant="inline"
          className="mt-5 max-w-5xl"
          title={actionError}
        />
      )}

      <div className="mt-7 grid max-w-5xl gap-7 lg:grid-cols-2">
        <Reveal delay={0.08}>
          <section className="kanso-panel h-full p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Inbox
                className="h-4 w-4 text-[var(--kanso-mint)]"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {t("incoming.title")}
              </h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.incoming.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--kanso-line)] p-4 text-sm text-[var(--kanso-muted)]">
                  {t("incoming.empty")}
                </p>
              ) : (
                data.incoming.map((request) =>
                  renderRequest(request, "incoming"),
                )
              )}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section className="kanso-panel h-full p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Send
                className="h-4 w-4 text-[var(--kanso-mint)]"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {t("outgoing.title")}
              </h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.outgoing.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--kanso-line)] p-4 text-sm text-[var(--kanso-muted)]">
                  {t("outgoing.empty")}
                </p>
              ) : (
                data.outgoing.map((request) =>
                  renderRequest(request, "outgoing"),
                )
              )}
            </div>
          </section>
        </Reveal>
      </div>

      <Reveal delay={0.16}>
        <section className="kanso-panel mt-7 max-w-5xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {t("list.title")}
            </h2>
            <span className="rounded-full border border-[var(--kanso-line)] px-2.5 py-1 text-xs font-semibold text-[var(--kanso-muted)]">
              {data.friends.length}
            </span>
          </div>

          {removeError && (
            <ErrorState variant="inline" className="mt-3" title={removeError} />
          )}

          {data.friends.length === 0 ? (
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
                onClick={() => setShareOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {t("list.emptyCta")}
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {data.friends.map(renderFriend)}
            </div>
          )}
        </section>
      </Reveal>

      <FriendShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        profile={data.profile}
      />
    </main>
  );
}
