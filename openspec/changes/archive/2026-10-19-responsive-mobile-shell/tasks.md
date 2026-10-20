# Tasks

## 1. CSS del armazón

- [x] 1.1 Acotar todas las reglas de `.sidebar-collapsed` a `@media (min-width: 1024px)`
- [x] 1.2 Poner `.app-content { margin-left: 0 }` por debajo de 1024 px y eliminar el media query de 900 px que forzaba 230 px
- [x] 1.3 Eliminar `.kanso-header`, que no usa ningún componente
- [x] 1.4 Estilos de la barra móvil (`kanso-mobile-bar`): pegajosa, en el flujo, con la marca y el botón de menú. Acotada a `max-width: 1023px` porque el CSS propio no está en una capa de Tailwind y, sin acotarla, ganaba a `lg:hidden`
- [x] 1.5 Estilos del cajón (`.kanso-sidebar` con `[data-open="true"]`), la capa atenuada (`.kanso-scrim`) y el botón de cerrar

## 2. Componente de navegación

- [x] 2.1 Estado `mobileOpen` efímero en `Header`, separado del colapso de escritorio
- [x] 2.2 Renderizar la barra superior solo por debajo de 1024 px, con el logotipo, el nombre y el botón de menú (`aria-expanded` y `aria-controls`)
- [x] 2.3 Pasar el panel a cajón en pantallas estrechas, sin afectar al panel fijo de escritorio
- [x] 2.4 Cerrar al cambiar de ruta, con `Escape`, con la capa atenuada y con el botón de cerrar
- [x] 2.5 Foco: entra al abrir, cicla con `Tab`/`Mayús+Tab` y vuelve al botón de menú al cerrar
- [x] 2.6 Bloquear el scroll del fondo mientras el cajón está abierto
- [x] 2.7 Ocultar en móvil el control de colapso de escritorio y mostrar el de cierre

## 3. Verificación

- [x] 3.1 Medir `scrollWidth - clientWidth` en Inicio, Búsqueda, Artistas, Novedades, Favoritos, Historial y Ajustes a 320, 390, 768, 1023, 1024 y 1440 px: 42 combinaciones, todas 0
- [x] 3.2 Verificar que con `sidebar-collapsed` guardado el móvil no hereda el ancho de 76 px ni el margen (cajón de 230 px, margen 0)
- [x] 3.3 Comprobar la apertura y cierre del cajón con ratón y con teclado (`Tab`, `Mayús+Tab`, `Escape`) y el retorno del foco
- [x] 3.4 Revisar a ojo que las rejillas no recortan por la derecha en tema claro y oscuro
- [x] 3.5 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
- [x] 3.6 `openspec validate responsive-mobile-shell`
- [x] 3.7 Comprobar que a 1200 px la barra móvil no se muestra y el panel sigue fijo y colapsable

## Notas de implementación

- El CSS propio de `globals.css` no vive en una capa de Tailwind, así que
  **gana a las utilidades**: `.kanso-mobile-bar { display: flex }` anulaba
  `lg:hidden` y la barra aparecía en escritorio. Se acota la regla al rango
  estrecho en vez de subir la especificidad. Es la trampa a recordar para
  cualquier regla nueva que compita con un `lg:`/`sm:`.
- `visibility` (no solo `transform`) deja el cajón cerrado fuera del orden de
  tabulación, y se retrasa 0,3 s para que la salida se vea.
- El cajón se cierra al pasar a escritorio (`matchMedia`), para no dejar el
  scroll del fondo bloqueado.

## Fuera de alcance

- Rejillas o tarjetas concretas que sigan apretadas tras arreglar el armazón: van
  en su propio cambio.
- Barra inferior tipo aplicación nativa.
- Páginas públicas (`/` y `/login`), que no usan panel.
