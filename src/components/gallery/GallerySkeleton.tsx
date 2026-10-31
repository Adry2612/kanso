import type { GalleryView } from "./GalleryViewToggle";
import { Skeleton } from "@/components/Skeleton";

type GallerySkeletonProps = {
  view?: GalleryView;
  count?: number;
};

export default function GallerySkeleton({
  view = "grid",
  count = 8,
}: GallerySkeletonProps) {
  if (view === "list") {
    return (
      <div className="mt-6 divide-y divide-[var(--kanso-line)]">
        {[...Array(count)].map((_, index) => (
          <div
            key={`gallery-skeleton-row-${index}`}
            className="flex items-center gap-3 py-3.5 sm:gap-4"
          >
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kanso-album-grid mt-6">
      {[...Array(count)].map((_, index) => (
        <div key={`gallery-skeleton-card-${index}`} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
