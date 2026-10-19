"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import ModalShell from "@/components/ModalShell";
import { useTranslations } from "@/context/I18nContext";
import type { FriendProfile } from "@/types/friends";

type FriendShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: FriendProfile | null;
};

export default function FriendShareModal({
  isOpen,
  onClose,
  profile,
}: FriendShareModalProps) {
  const t = useTranslations("friends");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = profile ? `${origin}/f/${profile.friendCode}` : "";

  useEffect(() => {
    if (!isOpen) return;

    setOrigin(window.location.origin);
    setCopied(false);
    setError(null);
    setCanShare(typeof navigator.share === "function");

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyLink = async () => {
    if (!link) return;
    setError(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.createElement("textarea");
        input.value = link;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setCopied(true);
    } catch {
      setError(t("share.copyError"));
    }
  };

  const shareLink = async () => {
    if (!link || !navigator.share) return;
    setError(null);
    try {
      await navigator.share({
        title: t("share.title"),
        text: t("share.nativeText"),
        url: link,
      });
    } catch (shareError) {
      // Cancelar la hoja nativa no es un error que haya que mostrar.
      if (
        shareError instanceof DOMException &&
        shareError.name === "AbortError"
      ) {
        return;
      }
      setError(t("share.shareError"));
    }
  };

  if (!profile) return null;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="friend-share-title"
      closeLabel={t("share.close")}
    >
      <div className="modal-shell-header">
        <p className="modal-shell-eyebrow">{t("share.eyebrow")}</p>
        <h2
          id="friend-share-title"
          className="display mt-2 text-2xl tracking-[-.04em] text-[var(--foreground)]"
        >
          {t("share.title")}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--kanso-muted)]">
          {t("share.description")}
        </p>
      </div>

      <div className="modal-shell-body">
        <div className="flex flex-col items-center gap-5">
          <div
            role="img"
            aria-label={t("share.qrLabel")}
            className="rounded-2xl bg-white p-4 shadow-[0_18px_45px_-28px_rgba(0,0,0,.45)]"
          >
            {origin && (
              <QRCodeSVG
                value={link}
                size={208}
                level="M"
                bgColor="#ffffff"
                fgColor="#1b2b20"
                marginSize={2}
              />
            )}
          </div>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--kanso-muted)]">
              {t("share.codeLabel")}
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-[.22em] text-[var(--foreground)]">
              {profile.friendCode}
            </p>
          </div>

          <div className="w-full rounded-xl border border-[var(--kanso-line)] bg-[var(--surface-1)]/55 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--kanso-muted)]">
              {t("share.linkLabel")}
            </p>
            <p className="mt-1 break-all text-sm text-[var(--foreground)]">
              {link}
            </p>
          </div>
        </div>
      </div>

      <div className="modal-shell-actions">
        <button
          type="button"
          onClick={copyLink}
          className="modal-action-secondary"
        >
          {copied ? t("share.copied") : t("share.copy")}
        </button>
        {canShare && (
          <button
            type="button"
            onClick={shareLink}
            className="modal-action-primary"
          >
            {t("share.share")}
          </button>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="border-t border-[var(--kanso-line)] px-6 py-4 text-sm text-[var(--kanso-danger)]"
        >
          {error}
        </p>
      )}
    </ModalShell>
  );
}
