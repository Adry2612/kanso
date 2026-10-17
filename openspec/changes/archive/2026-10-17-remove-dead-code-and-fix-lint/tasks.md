# Tasks

## 1. Borrar código muerto

- [x] 1.1 Borrar rutas: `src/app/home/mood/`, `src/app/home/activity/`, `src/app/home/recommendation/`, `src/app/home/recommendation-result/`
- [x] 1.2 Borrar componentes y utilidades: `src/app/home/components/GridSelector.tsx`, `src/components/LanguageSwitcher.tsx`, `src/components/heartButton.tsx`, `src/lib/recomendations/`
- [x] 1.3 Borrar el tipo `HeartButtonProps` de `src/types/components.ts` (solo lo usaba `heartButton`)
- [x] 1.4 Verificar que `/recomendation` (redirect) y el andamiaje de next-intl siguen en su sitio

## 2. Arreglar lint

- [x] 2.1 Quitar imports y variables sin usar (API `userFavorites`, `firebase.js`, `I18nContext`, `activityRecommendations`, páginas del historial y favoritos)
- [x] 2.2 Sustituir los `any` de rutas y utilidades por tipos concretos o `unknown`
- [x] 2.3 Corregir las dependencias de los hooks (`RecomendationPage`, `SaveAlbumModal`) o documentar la excepción
- [x] 2.4 Resolver los avisos de `<img>` con una excepción local y nota hacia `improve-performance`

## 3. Verificación

- [x] 3.1 `npx tsc --noEmit` sin errores
- [x] 3.2 `npm run lint` sin warnings accionables
- [x] 3.3 `npm run build` completando (parando antes el dev server)
