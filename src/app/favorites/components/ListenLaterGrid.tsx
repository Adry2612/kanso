import AlbumCard from "@/components/AlbumCard";
import { Stagger, StaggerItem } from "@/components/motion";
import type { ListenLaterItem } from "@/types/favorites";

type ListenLaterGridProps = {
  items: ListenLaterItem[];
  title: string;
  onOpenAlbum: (albumId: string) => void;
};

export default function ListenLaterGrid({
  items,
  title,
  onOpenAlbum,
}: ListenLaterGridProps) {
  return (
    <>
      <h2 className="mb-6 border-b border-green-900/30 pb-2 text-4xl font-bold text-[var(--foreground)]">
        {title}
      </h2>
      <Stagger
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
        stagger={0.04}
        onMount
      >
        {items.map((pendingAlbum) => (
          <StaggerItem key={pendingAlbum.id}>
            <AlbumCard
              album={pendingAlbum.album}
              onClick={() => onOpenAlbum(pendingAlbum.album.id)}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
