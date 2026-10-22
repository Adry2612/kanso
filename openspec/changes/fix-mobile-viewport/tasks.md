# Tasks

## 1. Marco de scroll móvil

- [x] 1.1 En `src/app/globals.css`, añadir el marco móvil (`max-width: 1023px`): `html`/`body` con altura visible y `overflow: hidden`, `body` como columna flex y `.app-content` como único scroller con `overscroll-behavior-y: none`; verificar en 390×844 que `document.scrollingElement` no desplaza y que el scroll ocurre dentro de `.app-content`
- [x] 1.2 Convertir la barra superior en hijo flex no sticky (`position: relative`, altura natural, fondo ~96 % opaco conservando el desenfoque) y neutralizar `min-h-screen` y `.public-page` dentro de `.app-content` con `min-height: 100%`; verificar que la barra no cambia de posición al llegar arriba y abajo y que la bienvenida sigue ocupando la pantalla
- [x] 1.3 Ajustar el cajón móvil (`height: 100dvh`, `overflow-y: auto`, `overscroll-behavior: contain`) y comprobar en 320×568 y en horizontal que el panel completo se puede recorrer sin arrastrar el fondo
- [x] 1.4 Crear `src/components/MobileViewport.tsx` y montarlo en `src/app/layout.tsx`: resetear `.app-content` a `top: 0` con `useLayoutEffect` al cambiar `usePathname`, y publicar `--visual-viewport-height` / `--visual-viewport-top` desde `visualViewport` (solo con `scale === 1`, con `requestAnimationFrame`); verificar que cada sección empieza arriba al navegar y que las variables aparecen y se limpian al redimensionar en DevTools

## 2. Áreas seguras y altura útil

- [x] 2.1 Centralizar el área segura inferior en `.app-content` (`env(safe-area-inset-bottom)`) y quitar el relleno duplicado de `.kanso-main` en móvil; verificar con un viewport con inset inferior que ningún control queda bajo el indicador de inicio y que el fondo llega al borde
- [x] 2.2 Revisar `.public-page`, login y perfil compartido dentro del nuevo marco: altura `100%`, sin `100vh` propio y sin franja inferior; verificar en 390×844 con la barra de Safari visible y oculta que la página llena el área visible y no gana scroll vertical con poco contenido
- [x] 2.3 Ajustar la pila de avisos (`kanso-toast-stack`) y cualquier elemento `fixed` inferior para usar el viewport visible y sus áreas seguras; verificar que un aviso en `/home` queda por encima del indicador de inicio y del teclado cuando procede

## 3. Campos sin zoom automático

- [x] 3.1 Añadir en `globals.css` la regla móvil `font-size: max(16px, 1em) !important` para `input`, `textarea`, `select` y `[contenteditable="true"]`, con un comentario que explique el umbral de iOS y que el `!important` está acotado a menos de 1024 px; verificar en 390 px que Búsqueda, Artistas, Amigos, Historial, Login, el buscador de emociones y el campo de etiquetas calculan al menos 16 px
- [ ] 3.2 Comprobar en un iPhone que enfocar cada uno de esos campos no cambia la escala de la página y que el gesto de pellizcar sigue ampliando y reduciendo; verificar también que los campos que ya eran mayores conservan su tamaño

## 4. Modales, teclado y bloqueo de scroll

- [x] 4.1 Crear un hook `useScrollLock` con contador que añada una clase al documento, bloquee `.app-content` en móvil y `body` en escritorio, compense el ancho de la barra de scroll y restaure el estado solo al cerrar el último consumidor; verificar con dos modales abiertos y cerrados en orden inverso
- [x] 4.2 Sustituir los bloqueos manuales de `Header`, `BaseModal`, `SelectedAlbumModal` y `FriendShareModal` por `useScrollLock`; verificar que abrir y cerrar el cajón, un modal y el modal de compartir deja el scroll utilizable y sin saltos
- [x] 4.3 En `globals.css`, medir `.modal-shell-overlay` con `var(--visual-viewport-height, 100dvh)` y `var(--visual-viewport-top, 0)`, y cambiar `.modal-shell-panel` de `88vh` a un porcentaje del overlay; verificar en 390×844 que el panel cabe, su cuerpo hace scroll y el botón de cerrar sigue visible
- [ ] 4.4 Probar en iPhone con el teclado abierto: enfocar el buscador de emociones y el campo de etiquetas, comprobar que el modal se ajusta, el campo enfocado sigue a la vista y el cierre funciona; al cerrar, verificar que el fondo no queda bloqueado ni desplazado

## 5. Verificación de integración

- [x] 5.1 Ejecutar `npx tsc --noEmit`, `npm run lint` y `npm run build`; corregir cualquier error y dejar los tres comandos en verde
- [x] 5.2 Revisar a 1024 px y 1280 px que el documento vuelve a ser el scroller, el panel lateral sigue fijo y colapsable y los modales no cambian de tamaño ni de posición
- [ ] 5.3 Recorrer en iPhone físico con Safari y Chrome: Inicio, Búsqueda, Artistas, Novedades, Favoritos, Historial, Amigos y Ajustes; comprobar scroll arriba/abajo, barra visible/oculta, sin franjas ni fondo sobre la barra, con el cajón abierto y cerrado
- [ ] 5.4 Repetir el recorrido a 320, 390 y 768 px y en horizontal, comprobando que no hay scroll horizontal, que las áreas seguras se respetan y que los campos y modales siguen operables; anotar en la revisión final cualquier diferencia entre Safari y Chrome iOS
- [ ] 5.5 Si hay un Android disponible, verificar en Chrome Android el scroll contenido, la barra dinámica y el teclado; si no, dejar constancia de que la validación Android queda pendiente

## Workflow follow-up

- Archivar el cambio cuando se cumplan los requisitos de revisión del proyecto.
- Verificar el resultado archivado y sincronizar la nueva capability `mobile-viewport`.
