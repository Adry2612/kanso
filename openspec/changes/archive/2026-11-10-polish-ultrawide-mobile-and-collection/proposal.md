# Proposal

## Why

La aplicación ya funciona en escritorio y móvil, pero quedan asperezas visibles al usarla a diario: en pantallas ultrawide el degradado de fondo se corta en el borde del contenido y la composición no aprovecha el espacio; los estados vacíos de la colección quedan pegados a la izquierda; el filtro rápido de emoción no se refleja en las cápsulas de cada disco; y quien todavía no tiene colección no recibe una invitación clara a guardar su primer álbum. En móvil, una sesión anónima guardada puede devolver a la persona directamente a la app sin pasar por la bienvenida, el acceso con Google no abre el selector de cuenta y el navegador sigue mostrando su barra de rutas y botones. Este cambio cierra esas brechas sin tocar datos ni el modelo de recomendaciones.

## What Changes

- **Fondo continuo en pantallas ultrawide.** El sombreado que da cuerpo a cada pantalla deja de quedar recortado por el ancho máximo del contenido: cubre siempre el viewport completo, en tema claro y oscuro, también en las fichas de álbum y recomendación con degradado propio.
- **Composición adaptativa en ultrawide.** El ancho máximo del contenido crece por tramos y la distribución gana columnas y bloques laterales, de modo que la interfaz no se vea pequeña ni desaproveche el espacio en monitores anchos.
- **Estados vacíos centrados.** «No hay discos que coincidan» y «Todavía no tienes álbumes en tu colección» se centran en el área de contenido, tanto en la colección como en pendientes.
- **Emoción filtrada remarcada.** Al activar una o varias emociones en el selector rápido de la colección, las cápsulas de emoción de cada disco remarcan en verde las que están filtrando, con una señal adicional que no depende solo del color.
- **Primer disco como siguiente paso.** Cuando la persona no tiene colección, el inicio y el resultado de recomendación la invitan explícitamente a añadir su primer disco, en lugar de mostrar un vacío genérico.
- **Bienvenida siempre para invitados.** Una sesión anónima guardada ya no salta la bienvenida: al abrir `/` se muestra la landing y solo se entra como invitado si se elige explícitamente, reutilizando la sesión existente. Una cuenta real sí puede continuar directamente a `/home`.
- **Google móvil mediante redirección.** En pantallas estrechas el acceso con Google usa el flujo de redirección con selector de cuenta, en lugar de una ventana emergente que el navegador móvil bloquea o cierra y que deja a la persona como invitada.
- **Aplicación instalable sin chrome del navegador.** Se declara un manifiesto PWA con el icono de Kanso y modo `standalone`, de forma que al abrir la app desde el icono instalado no aparezcan la barra de rutas ni los botones del navegador. En una pestaña normal el navegador conserva su chrome, algo que la web no puede ocultar.

## Capabilities

### New Capabilities

- `adaptive-layout`: continuidad del fondo a todo el viewport y crecimiento por tramos del ancho y la composición del contenido en pantallas ultrawide.

### Modified Capabilities

- `album-collection`: estados vacíos centrados y remarcado de las emociones activas en las cápsulas de cada disco.
- `recommendations`: invitación a añadir el primer disco cuando la colección está vacía, tanto en el inicio como en el resultado sin coincidencias.
- `authentication`: acceso con Google por redirección en móvil, con selector de cuenta y retorno seguro.
- `navigation`: la bienvenida se muestra siempre a las sesiones anónimas, la prueba como invitado es explícita y solo las cuentas reales continúan a `/home`.
- `brand-identity`: manifiesto de aplicación instalable con icono de Kanso y apertura sin chrome del navegador.

## Impact

- **Fondo y composición:** `src/app/globals.css` (capa de fondo, `--page-*`, anchos máximos y rejillas), `layout.tsx` y las pantallas con degradado propio (`albums/[albumId]`, `home/pages/RecomendationPage`).
- **Colección:** `src/app/collection/page.tsx`, `CollectionEmptyState`, `CollectionMoodChips` y los badges de emoción de las tarjetas y filas.
- **Inicio y recomendación:** `useHomeStart`, `StartPage`, `RecomendationPage` y `useRecommendation`, con nuevos textos en `src/locales/es.json` y `en.json`.
- **Autenticación:** `lib/firebaseAuth.ts`, `hooks/client/useLoginForm.ts`, `AuthContext`, `page.tsx` de la landing y el acceso.
- **Instalación:** nuevo `public/manifest.webmanifest` (o equivalente) y metadatos en `src/app/layout.tsx`; sin dependencias nuevas.
- **Specs:** delta de `adaptive-layout` nueva y de `album-collection`, `recommendations`, `authentication`, `navigation` y `brand-identity`. Sin cambios en API, Firestore ni el algoritmo de recomendaciones.

## Fuera de alcance

- Ocultar la barra del navegador en una pestaña normal; solo se consigue al abrir la app instalada en modo `standalone`.
- Convertir la aplicación en una PWA offline con service worker o caché de recursos.
- Cambiar el algoritmo de recomendación, el esquema de Firestore o la API.
- Rediseñar por completo la colección, el inicio o la landing más allá de los estados vacíos y el remarcado de filtros.
- Notificaciones push, instalación forzada o pantallas de promoción de la PWA.
