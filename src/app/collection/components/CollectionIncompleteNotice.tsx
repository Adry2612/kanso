import { CircleAlert, X } from "lucide-react";

type CollectionIncompleteNoticeProps = {
  message: string;
  detail?: string;
  reviewLabel: string;
  dismissLabel: string;
  onReview: () => void;
  onDismiss: () => void;
};

export default function CollectionIncompleteNotice({
  message,
  detail,
  reviewLabel,
  dismissLabel,
  onReview,
  onDismiss,
}: CollectionIncompleteNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--kanso-mint)]/25 bg-[var(--kanso-mint)]/5 px-4 py-3 sm:flex-row sm:items-center"
    >
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--kanso-mint)]/25 bg-[var(--kanso-mint)]/10 text-[var(--kanso-mint)]">
        <CircleAlert className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          {message}
        </p>
        {detail && (
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--kanso-muted)]">
            {detail}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onReview}
          className="rounded-lg bg-[var(--kanso-mint)] px-3 py-2 text-xs font-semibold text-[var(--background)] transition hover:brightness-105"
        >
          {reviewLabel}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          title={dismissLabel}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--kanso-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
