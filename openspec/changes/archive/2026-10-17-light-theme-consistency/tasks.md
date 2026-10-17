# Tasks

## 1. Tokens

- [x] 1.1 Confirmar en `src/app/globals.css` los tokens del tema claro que faltaban (`--surface-*`, `--collectify-line-strong`, `--collectify-danger`)

## 2. Migración de pantallas y componentes vivos

- [x] 2.1 Migrar `src/components` (AlbumCard, ArtistCard, Header, BaseModal, FilterModal, SortModal, TagList, AlbumTracklist, Skeleton, MoodSelector)
- [x] 2.2 Migrar pantallas: search (y pasos del modal), favorites, artists y artists/[id], albums/[albumId], releases, recomendationHistory, recommendation y recommendation/result, settings, login
- [x] 2.3 Barrido final: sin literales de la paleta oscura (`[#...]`, `emerald-*`, `neutral-*`, `gray-*`, `text-white`) en ficheros vivos

## 3. Verificación

- [x] 3.1 `npx tsc --noEmit` y lint sin errores nuevos
- [x] 3.2 Revisión visual en tema claro y oscuro de las pantallas principales (search, favorites, artists, releases, album, ajustes)

## Fuera de alcance

- Rutas y componentes muertos (`/home/mood`, `/home/activity`, `/home/recommendation*`, `/recomendation`, `GridSelector`, `LanguageSwitcher`): se eliminan en `remove-dead-code-and-fix-lint`.
