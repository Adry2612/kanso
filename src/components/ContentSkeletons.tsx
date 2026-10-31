import { Skeleton } from "@/components/Skeleton";

const GRID_CLASS =
  "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6";

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
  variant = "panel",
}: {
  count?: number;
  withAction?: boolean;
  variant?: "panel" | "plain";
}) {
  const isPlain = variant === "plain";
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {visibleItems(count).map((index) => (
        <div
          key={index}
          className={
            isPlain
              ? "flex h-full w-full flex-col"
              : "kanso-card flex h-full w-full flex-col p-2"
          }
        >
          <Skeleton className="aspect-square w-full rounded-[var(--radius-xs)]" />
          <div className={isPlain ? "mt-3" : "px-2 pb-2 pt-3"}>
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

/** Detalle de un álbum: portada, cabecera, pistas y registro guardado. */
export function AlbumDetailSkeleton() {
  return (
    <main className="kanso-main min-h-screen" aria-hidden="true">
      <Skeleton className="h-4 w-16" />

      <div className="mt-6 grid w-full items-start gap-8 border-b border-[var(--kanso-line)] pb-10 md:grid-cols-[320px_1fr] md:gap-16">
        <Skeleton className="aspect-square w-full max-w-[320px] rounded-[var(--radius-md)]" />
        <div className="flex min-w-0 flex-col gap-4 pt-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-14 w-4/5" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-3/4 max-w-md" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-11 w-40 rounded-xl" />
            <Skeleton className="h-11 w-44 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start xl:gap-12">
        <div>
          <Skeleton className="h-6 w-44" />
          <div className="mt-4 border-t border-[var(--kanso-line)]">
            {visibleItems(9).map((index) => (
              <div
                key={index}
                className="grid grid-cols-[30px_1fr] items-center gap-3 border-b border-[var(--kanso-line)] px-1 py-3"
              >
                <Skeleton className="h-3 w-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-3/5" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="order-first xl:order-none">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-32 w-full rounded-2xl" />
        </div>
      </div>
    </main>
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
