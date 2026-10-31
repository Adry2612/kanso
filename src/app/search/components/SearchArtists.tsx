import ArtistCard from "@/components/ArtistCard";
import { Stagger, StaggerItem } from "@/components/motion";
import { useTranslations } from "@/context/I18nContext";
import type { SpotifyArtist } from "@/types/album";

interface SearchArtistsProps {
  artists: SpotifyArtist[];
}

export default function SearchArtists({ artists }: SearchArtistsProps) {
  const t = useTranslations("search");

  if (artists.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {t("artistsTitle")}
      </h2>
      <Stagger
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 md:gap-6 2xl:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6"
        stagger={0.04}
        onMount
      >
        {artists.map((artist) => (
          <StaggerItem key={artist.id} className="h-full">
            <ArtistCard artist={artist} isFavorite={false} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
