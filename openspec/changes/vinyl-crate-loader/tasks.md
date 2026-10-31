# Tasks

## 1. Coordinación

- [x] 1.1 Registrar la línea base con `npx tsc --noEmit` y `npm run lint`, y confirmar que `polish-visual-consistency` sigue activo sin depender de él para esta spec

## 2. Cajón de vinilos

- [x] 2.1 Crear `src/components/album/VinylCrateLoader.tsx` con una pila de 5 portadas en abanico, una portada que se adelanta en ciclo escalonado mediante `motion`, y variante estática con `prefers-reduced-motion: reduce`; verificar con `npx tsc --noEmit`
- [x] 2.2 Añadir los estilos de la pila en `src/app/globals.css` (abanico, portadas, vinilo y transición) usando los tokens de Kanso, sin colores nuevos
- [x] 2.3 Marcar el dibujo como decorativo (`aria-hidden`) y comprobar que el contenedor de carga conserva `role="status"`, `aria-busy="true"` y el texto `sr-only`

## 3. Integración en la recomendación

- [x] 3.1 Sustituir el esqueleto cuadrado de portada en la rama de carga de `src/app/home/pages/RecomendationPage.tsx` por `VinylCrateLoader`, conservando el `aspect-square`, el ancho máximo y las líneas de título, artistas y tracklist
- [x] 3.2 Verificar que al terminar la carga el cajón se sustituye por la ficha sin saltos de maquetación y que error y sin coincidencias no muestran el cajón

## 4. Verificación

- [x] 4.1 Comprobar la pila en tema claro y oscuro y a 320, 390, 768 y 1440 px, sin desborde horizontal ni saltos
- [x] 4.2 Comprobar con `prefers-reduced-motion: reduce` que la pila es estática y que la carga sigue anunciándose a lectores de pantalla
- [ ] 4.3 Ejecutar `npx tsc --noEmit` y `npm run lint`; cuando el servidor de desarrollo esté parado, `npm run build`
- [x] 4.4 Validar el cambio con `npx openspec validate vinyl-crate-loader --strict`
