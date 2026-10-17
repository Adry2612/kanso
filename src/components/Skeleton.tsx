import React from "react";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`shimmer rounded-md bg-neutral-700/70 ${className}`}
      aria-hidden="true"
    />
  );
}
