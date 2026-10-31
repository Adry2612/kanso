/** Ramas canónicas de género que entiende la aplicación. */
export const GENRE_BRANCHES = [
  "pop",
  "rock",
  "hip-hop",
  "metal",
  "r&b",
  "jazz",
  "electronic",
  "classical",
  "indie",
  "folk",
  "reggaeton",
  "soul",
  "punk",
  "country",
  "ambient",
  "blues",
] as const;

export type GenreBranch = (typeof GENRE_BRANCHES)[number];

type GenreRule = { branch: GenreBranch; pattern: RegExp };

/**
 * Reglas ordenadas por especificidad: la primera coincidencia gana. Así
 * `latin hip hop` cae en `hip-hop` antes que en `pop`, y `powermetal` o
 * `metalcore` caen en `metal`.
 */
const GENRE_RULES: GenreRule[] = [
  {
    branch: "hip-hop",
    pattern: /\b(hip[ -]?hop|rap|trap|drill|grime|boom bap)\b/i,
  },
  {
    branch: "metal",
    pattern:
      /\b(powermetal|power metal|metal|metalcore|deathcore|grindcore)\b/i,
  },
  { branch: "punk", pattern: /\b(punk|hardcore|emo|post-hardcore)\b/i },
  { branch: "r&b", pattern: /\b(r&b|rnb|contemporary r&b)\b/i },
  { branch: "soul", pattern: /\b(soul|motown)\b/i },
  { branch: "jazz", pattern: /\b(jazz|bebop|swing)\b/i },
  {
    branch: "classical",
    pattern: /\b(classical|orchestra|opera|baroque)\b/i,
  },
  {
    branch: "electronic",
    pattern:
      /\b(electronic|edm|house|techno|trance|dubstep|drum and bass|dnb)\b/i,
  },
  { branch: "indie", pattern: /\b(indie|bedroom)\b/i },
  { branch: "rock", pattern: /\b(rock|grunge|shoegaze|alternative)\b/i },
  { branch: "pop", pattern: /\bpop\b/i },
  { branch: "folk", pattern: /\b(folk|singer-songwriter|acoustic)\b/i },
  { branch: "country", pattern: /\b(country|americana)\b/i },
  {
    branch: "reggaeton",
    pattern: /\b(reggaeton|reggaetón|dembow|latin)\b/i,
  },
  { branch: "ambient", pattern: /\b(ambient|chillout)\b/i },
  { branch: "blues", pattern: /\bblues\b/i },
];

/** Clave de traducción de cada rama, para la interfaz. */
export const GENRE_BRANCH_LABEL_KEYS: Record<GenreBranch, string> = {
  pop: "pop",
  rock: "rock",
  "hip-hop": "hiphop",
  metal: "metal",
  "r&b": "randb",
  jazz: "jazz",
  electronic: "electronic",
  classical: "classical",
  indie: "indie",
  folk: "folk",
  reggaeton: "reggaeton",
  soul: "soul",
  punk: "punk",
  country: "country",
  ambient: "ambient",
  blues: "blues",
};

/** Clave de traducción de una rama, o la cadena original si no se reconoce. */
export function genreBranchLabelKey(branch: string): string {
  return GENRE_BRANCH_LABEL_KEYS[branch as GenreBranch] ?? branch;
}

/** Mapea un género crudo de Spotify a su rama principal, o `null`. */
export function mapSpotifyGenreToBranch(genre: string): GenreBranch | null {
  const value = genre.trim();
  if (!value) return null;

  return GENRE_RULES.find(({ pattern }) => pattern.test(value))?.branch ?? null;
}

/** Mapea y deduplica una lista de géneros, en el orden canónico. */
export function mapSpotifyGenres(genres: readonly string[]): GenreBranch[] {
  const matched = new Set(
    genres
      .map(mapSpotifyGenreToBranch)
      .filter((branch): branch is GenreBranch => Boolean(branch)),
  );

  return GENRE_BRANCHES.filter((branch) => matched.has(branch));
}
