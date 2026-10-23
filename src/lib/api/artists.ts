export {
  getArtistAlbums,
  getArtistInfo,
  getArtistReleases,
  getUserArtists,
  searchArtists,
  toggleArtistFavorite,
} from "@/services/client/artists";

export type {
  ArtistAlbumLite,
  ArtistLite,
  ArtistRelease,
} from "@/types/artists";
