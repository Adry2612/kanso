"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link as TransitionLink } from "next-view-transitions";
import { ArrowLeft, UserPlus, UsersRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import FriendAvatar from "@/components/FriendAvatar";
import { Skeleton } from "@/components/Skeleton";
import { getPublicProfile, sendFriendRequest } from "@/lib/api/friends";
import type { PublicProfileResponse } from "@/types/friends";

function loginHref(code: string, mode: "login" | "register") {
  return `/login?mode=${mode}&next=${encodeURIComponent(`/f/${code}`)}`;
}

export default function PublicFriendProfilePage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code ?? "");
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("friends");

  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setError(null);
    setActionError(null);

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
      .catch((loadError) => {
        if (!active) return;
        setProfile(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudo cargar el perfil.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, code, user?.uid, user?.isAnonymous]);

  const handleAdd = async () => {
    if (!user || user.isAnonymous) return;

    setSending(true);
    setActionError(null);
    try {
      const result = await sendFriendRequest(code);
      setProfile((current) =>
        current
          ? {
              ...current,
              relation: result.status === "accepted" ? "friend" : "pending",
              pendingDirection:
                result.status === "accepted" ? undefined : "outgoing",
            }
          : current,
      );
    } catch (sendError) {
      setActionError(
        sendError instanceof Error ? sendError.message : t("public.error"),
      );
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
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center gap-4 py-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-52 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
          <Skeleton className="mt-4 h-11 w-full" />
        </div>
      );
    }

    if (notFound) {
      return (
        <div className="py-4 text-center">
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--kanso-line)] bg-[var(--surface-2)] text-[var(--kanso-muted)]">
            <UsersRound className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {t("public.notFoundTitle")}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
            {t("public.notFoundDescription")}
          </p>
          <TransitionLink
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("public.backHome")}
          </TransitionLink>
        </div>
      );
    }

    if (error || !profile) {
      return (
        <div className="py-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            {t("loadError")}
          </h1>
          <p
            role="alert"
            className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--kanso-danger)]"
          >
            {error ?? t("loadError")}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)]"
          >
            {t("retry")}
          </button>
        </div>
      );
    }

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
              {!user ? (
                <div>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
                    {t("public.loginTitle")}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <TransitionLink
                      href={loginHref(code, "register")}
                      className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
                    >
                      {t("public.register")}
                    </TransitionLink>
                    <TransitionLink
                      href={loginHref(code, "login")}
                      className="rounded-xl border border-[var(--kanso-line)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--kanso-mint)]/50"
                    >
                      {t("public.login")}
                    </TransitionLink>
                  </div>
                </div>
              ) : user.isAnonymous ? (
                <div>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--kanso-muted)]">
                    {t("public.guestDescription")}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <TransitionLink
                      href={loginHref(code, "register")}
                      className="rounded-xl bg-[var(--kanso-mint)] px-4 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105"
                    >
                      {t("public.register")}
                    </TransitionLink>
                    <TransitionLink
                      href={loginHref(code, "login")}
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
                    onClick={handleAdd}
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--kanso-mint)] px-5 py-3 text-sm font-bold text-[var(--background)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <UserPlus className="h-4 w-4" aria-hidden="true" />
                    {sending ? t("public.adding") : t("public.add")}
                  </button>
                  {actionError && (
                    <p
                      role="alert"
                      className="mx-auto mt-3 max-w-sm text-sm text-[var(--kanso-danger)]"
                    >
                      {actionError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <div className="relative z-10 w-full max-w-lg">
        <TransitionLink
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--kanso-mint)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("public.backHome")}
        </TransitionLink>

        <section className="public-card mt-8 p-6 sm:p-8">
          {renderContent()}
        </section>

        <p className="mt-5 text-center text-[11px] uppercase tracking-[.18em] text-[var(--kanso-muted)]">
          {t("public.title")}
        </p>
      </div>
    </main>
  );
}
