import { Skeleton } from "@/components/Skeleton";

const GRID_CLASS =
  "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6";

const visibleItems = (count: number) =>
  Array.from({ length: count }, (_, index) => index);

/** Rejilla de tarjetas de artista mientras se cargan los datos. */
export function ArtistGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {visibleItems(count).map((index) => (
        <div
          key={index}
          className="kanso-card flex h-full w-full flex-col items-center gap-3 p-4"
        >
          <Skeleton className="h-28 w-28 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="mt-auto h-7 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Rejilla de novedades mientras se cargan los lanzamientos. */
export function ReleaseGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {visibleItems(count).map((index) => (
        <div key={index} className="kanso-card flex h-full w-full flex-col p-2">
          <Skeleton className="aspect-square w-full rounded-[var(--radius-xs)]" />
          <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="mt-2 h-3 w-1/2" />
            <Skeleton className="mt-5 h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Rejilla de álbumes para los resultados de búsqueda. */
export function AlbumGridSkeleton({
  count = 8,
  withAction = false,
}: {
  count?: number;
  withAction?: boolean;
}) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {visibleItems(count).map((index) => (
        <div key={index} className="kanso-card flex h-full w-full flex-col p-2">
          <Skeleton className="aspect-square w-full rounded-[var(--radius-xs)]" />
          <div className="px-2 pb-2 pt-3">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="mt-2 h-3 w-1/2" />
            {withAction && (
              <Skeleton className="mt-3 h-9 w-full rounded-[var(--radius-xs)]" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Chips de emociones y etiquetas de la colección en la búsqueda. */
export function CollectionSkeleton() {
  return (
    <div className="mt-5 space-y-5" aria-hidden="true">
      <div>
        <Skeleton className="h-3 w-36" />
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleItems(5).map((index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-3 w-32" />
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleItems(4).map((index) => (
            <Skeleton key={index} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
