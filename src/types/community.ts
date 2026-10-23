/** Tipos de la actividad de la comunidad. */

export type CommunityAlbum = {
  id: string;
  name: string;
  images: { url: string }[];
  artists: { name: string }[];
};

export type CommunitySearch = {
  term: string;
  count: number;
  lastAt: string | null;
};
