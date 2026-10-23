import AlbumCard from "@/components/AlbumCard";
import { Stagger, StaggerItem } from "@/components/motion";
import type { GroupedFavorites } from "@/types/favorites";

type FavoritesCollectionGridProps = {
  groups: GroupedFavorites[];
  onOpenAlbum: (albumId: string) => void;
};

export default function FavoritesCollectionGrid({
  groups,
  onOpenAlbum,
}: FavoritesCollectionGridProps) {
  return (
    <>
      {groups.map((group, index) => (
        <div key={`${group.groupName}-${index}`} className="mb-12">
          <h2 className="mb-6 border-b border-green-900/30 pb-2 text-4xl font-bold text-[var(--foreground)]">
            {group.groupName}
          </h2>
          <Stagger
            className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
            stagger={0.04}
            onMount
          >
            {group.items.map((favorite) => (
              <StaggerItem key={favorite.album.id}>
                <AlbumCard
                  album={favorite.album}
                  onClick={() => onOpenAlbum(favorite.album.id)}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      ))}
    </>
  );
}
