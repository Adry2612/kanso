import React from "react";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`shimmer rounded-md bg-[var(--surface-3)] ${className}`}
      aria-hidden="true"
    />
  );
}
