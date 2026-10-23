"use client";

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
import { useFriendsPage } from "@/hooks/client/useFriendsPage";
import { useFriendSharing } from "@/hooks/client/useFriendSharing";
import { friendLoginHref, SHARING_SECTIONS } from "@/utils/friends";
import FriendList from "./components/FriendList";
import FriendRequestList from "./components/FriendRequestList";

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("friends");

  const {
    data,
    loading,
    error: loadError,
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
  } = useFriendsPage({
    invalidCode: t("add.invalidCode"),
    addSent: t("add.sent"),
    addAccepted: t("add.accepted"),
    addError: t("add.error"),
    requestError: t("actionError"),
    removeError: t("list.removeError"),
  });

  const { sharingBusy, sharingError, changeSharing } = useFriendSharing({
    profile: data?.profile ?? null,
    onSharingChange: applySharing,
    errorMessage: t("privacy.error"),
  });

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
                href={friendLoginHref("/friends", "register")}
                className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
              >
                {isGuest
                  ? t("guest.createAccount")
                  : t("noSession.createAccount")}
              </Link>
              <Link
                href={friendLoginHref("/friends", "login")}
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
            onClick={openShare}
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
            onSubmit={(event) => {
              event.preventDefault();
              void addFriend();
            }}
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
                    onClick={() => void changeSharing(section, !enabled)}
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
            <div className="mt-4">
              <FriendRequestList
                requests={data.incoming}
                direction="incoming"
                busyRequestId={busyRequestId}
                busyAction={busyAction}
                onRespond={(requestId, action) =>
                  void respondToRequest(requestId, action)
                }
                emptyLabel={t("incoming.empty")}
              />
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
            <div className="mt-4">
              <FriendRequestList
                requests={data.outgoing}
                direction="outgoing"
                busyRequestId={busyRequestId}
                busyAction={busyAction}
                onRespond={(requestId, action) =>
                  void respondToRequest(requestId, action)
                }
                emptyLabel={t("outgoing.empty")}
              />
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

          <FriendList
            friends={data.friends}
            confirmRemoveUid={confirmRemoveUid}
            removingUid={removingUid}
            onAskRemove={askRemoveFriend}
            onCancelRemove={cancelRemoveFriend}
            onConfirmRemove={() => void confirmRemoveFriend()}
            onShare={openShare}
          />
        </section>
      </Reveal>

      <FriendShareModal
        isOpen={shareOpen}
        onClose={closeShare}
        profile={data.profile}
      />
    </main>
  );
}
