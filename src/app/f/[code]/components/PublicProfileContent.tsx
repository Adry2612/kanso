"use client";

import { Link as TransitionLink } from "next-view-transitions";
import { UserPlus, UsersRound } from "lucide-react";
import FriendAvatar from "@/components/FriendAvatar";
import ErrorState from "@/components/ErrorState";
import { useTranslations } from "@/context/I18nContext";
import { friendLoginHref } from "@/utils/friends";
import type { PublicProfileResponse } from "@/types/friends";

type PublicProfileContentProps = {
  code: string;
  profile: PublicProfileResponse;
  viewer: "guest" | "anonymous" | "authenticated";
  sending: boolean;
  actionError: string | null;
  onAdd: () => void;
};

/** Contenido del perfil público según la relación con quien lo visita. */
export default function PublicProfileContent({
  code,
  profile,
  viewer,
  sending,
  actionError,
  onAdd,
}: PublicProfileContentProps) {
  const t = useTranslations("friends");

  return (
    <div className="text-center">
      <FriendAvatar
        displayName={profile.displayName}
        photoURL={profile.photoURL}
        size="lg"
        className="mx-auto"
      />
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[.2em] text-[var(--kanso-mint)]">
        {t("public.eyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[var(--foreground)]">
        {profile.displayName}
      </h1>

      <div className="mt-7">
        {profile.relation === "self" && (
          <div>
            <p className="text-sm font-semibold text-[var(--kanso-mint)]">
              {t("public.self")}
            </p>
            <TransitionLink
              href="/friends"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
            >
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              {t("public.goToFriends")}
            </TransitionLink>
          </div>
        )}

        {profile.relation === "friend" && (
          <div>
            <p className="text-sm font-semibold text-[var(--kanso-mint)]">
              {t("public.accepted")}
            </p>
            <TransitionLink
              href="/friends"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
            >
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              {t("public.goToFriends")}
            </TransitionLink>
          </div>
        )}

        {profile.relation === "pending" && (
          <div>
            <p className="text-sm font-semibold text-[var(--kanso-muted)]">
              {profile.pendingDirection === "incoming"
                ? t("public.pendingIncoming")
                : t("public.requestSent")}
            </p>
            {profile.pendingDirection === "incoming" && (
              <TransitionLink
                href="/friends"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
              >
                <UsersRound className="h-4 w-4" aria-hidden="true" />
                {t("public.goToFriends")}
              </TransitionLink>
            )}
          </div>
        )}

        {profile.relation === "none" && (
          <div>
            {viewer === "guest" ? (
              <div>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("public.loginTitle")}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <TransitionLink
                    href={friendLoginHref(`/f/${code}`, "register")}
                    className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
                  >
                    {t("public.register")}
                  </TransitionLink>
                  <TransitionLink
                    href={friendLoginHref(`/f/${code}`, "login")}
                    className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
                  >
                    {t("public.login")}
                  </TransitionLink>
                </div>
              </div>
            ) : viewer === "anonymous" ? (
              <div>
                <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
                  {t("public.guestDescription")}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <TransitionLink
                    href={friendLoginHref(`/f/${code}`, "register")}
                    className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
                  >
                    {t("public.register")}
                  </TransitionLink>
                  <TransitionLink
                    href={friendLoginHref(`/f/${code}`, "login")}
                    className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
                  >
                    {t("public.login")}
                  </TransitionLink>
                </div>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={onAdd}
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-5 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  {sending ? t("public.adding") : t("public.add")}
                </button>
                {actionError && (
                  <ErrorState
                    variant="inline"
                    className="mx-auto mt-3 max-w-sm text-left"
                    title={t("public.error")}
                    description={actionError}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
