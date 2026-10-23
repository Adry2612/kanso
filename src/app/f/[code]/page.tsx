"use client";

import { useParams } from "next/navigation";
import { Link as TransitionLink } from "next-view-transitions";
import { ArrowLeft, UsersRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/context/I18nContext";
import { Skeleton } from "@/components/Skeleton";
import ErrorState from "@/components/ErrorState";
import { usePublicProfile } from "@/hooks/client/usePublicProfile";
import PublicProfileContent from "./components/PublicProfileContent";

export default function PublicFriendProfilePage() {
  const params = useParams<{ code: string }>();
  const code = String(params?.code ?? "");
  const { user } = useAuth();
  const t = useTranslations("friends");

  const { profile, loading, notFound, error, sending, actionError, addFriend } =
    usePublicProfile(code, {
      actionError: t("public.error"),
    });

  const viewer = !user
    ? "guest"
    : user.isAnonymous
      ? "anonymous"
      : "authenticated";

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
        <div className="py-4">
          <ErrorState
            title={t("loadError")}
            description={error ?? t("loadErrorDescription")}
            onRetry={() => window.location.reload()}
            retryLabel={t("retry")}
          />
        </div>
      );
    }

    return (
      <PublicProfileContent
        code={code}
        profile={profile}
        viewer={viewer}
        sending={sending}
        actionError={actionError}
        onAdd={() => void addFriend()}
      />
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
