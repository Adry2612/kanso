"use client";

import { useEffect, useState } from "react";

type FriendAvatarProps = {
  displayName: string;
  photoURL?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-11 w-11 text-xs",
  lg: "h-20 w-20 text-xl",
} as const;

function initialsFor(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  return initials || "?";
}

function isSafeImageUrl(value: string) {
  return value.startsWith("https://") || value.startsWith("http://");
}

export default function FriendAvatar({
  displayName,
  photoURL,
  size = "md",
  className = "",
}: FriendAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoURL]);

  const showImage =
    Boolean(photoURL) && isSafeImageUrl(photoURL ?? "") && !failed;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--kanso-line-strong)] bg-[var(--surface-3)] font-semibold tracking-[-.02em] text-[var(--kanso-mint)] ${SIZE_CLASSES[size]} ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoURL ?? ""}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initialsFor(displayName)
      )}
    </span>
  );
}
