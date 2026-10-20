# Tasks

> **Estado: CERRADO (2026-10-19).** No implementar. El trabajo se asume en
> `redesign-carrousel-feelings`; ver `proposal.md` para el motivo y
> `design.md` de ese change para el feedback a no repetir.

## 0. Aprendido de la primera vuelta (no repetir)

- [x] 0.1 No agrupar con rótulos de familia: alargó el bloque y no ayudó a recorrerlo
- [x] 0.2 Mantener las **cajas** (emoji grande + etiqueta), no pastillas
- [x] 0.3 Que no ocupe más a lo alto que la rejilla anterior
- [x] 0.4 No perder protagonismo del emoji ni la facilidad de recorrerlo de un vistazo
- [x] 0.5 Evitar que quede plano/soso: hace falta más carácter, no menos

## 1. Catálogo y agrupación

- [~] 1.1 Añadir a `src/constants/moods.ts` los metadatos de agrupación (4 familias) sin tocar claves, etiquetas ni emoji — **descartado**: la agrupación se rechazó
- [~] 1.2 Añadir las etiquetas de familia a `src/locales/es.json` y `src/locales/en.json` (namespace `moodGroups`) — **descartado**
- [~] 1.3 Las actividades no necesitan agrupación: se muestran en una única fila de opciones — **superado** por el carrusel compartido

## 2. Componente único

- [x] 2.1 Retirar de `src/components/MoodSelector.tsx` el carrusel (flechas, rueda, puntos y `activeIndex`) — hecho en `redesign-carrousel-feelings`
- [~] 2.2 Sustituir el boolean `compact` por la variante de densidad `size` — **descartado**: el componente quedó como rejilla para el modal y el filtro
- [x] 2.3 Lenguaje visual: mantener las cajas con el emoji con protagonismo (la versión en pastillas se rechazó) — asumido por el medallón compartido
- [x] 2.4 Accesibilidad: `aria-pressed`, `role="group"` con nombre, contraste en ambos temas, transición y escala bajo `prefers-reduced-motion` — asumido por el medallón y el carrusel

## 3. Integración

- [x] 3.1 Usar el componente unificado en `StartPage` (emoción/actividad) y en `SaveAlbumModal` — resuelto: carrusel en el inicio, rejilla con medallón en el modal
- [x] 3.2 `FilterModal` reutiliza la misma marca — resuelto con el medallón compartido
- [x] 3.3 Simplificar el flujo del modal a claves canónicas: `MoodBubble` resuelve la etiqueta traducida — hecho en `redesign-carrousel-feelings`
- [x] 3.4 Mantener intactos los flujos: paso 2 (formato/etiquetas), recomendación rápida y estados vacíos — verificado

## 4. Verificación

- [x] 4.1 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores — verificado en `redesign-carrousel-feelings`
- [x] 4.2 Comprobar que las 15 emociones están agrupadas, sin duplicados ni huérfanas — **N/A**: no hay agrupación
- [x] 4.3 La home renderiza el selector — verificado
- [x] 4.4 Revisión visual del usuario — la vuelta 1 se rechazó; el resultado vigente es el carrusel aprobado

## Notas

- Este change **no se implementa**: se cierra para no dejar dos planes vivos del
  mismo componente. El registro de la decisión y del feedback queda aquí y en
  `redesign-carrousel-feelings`.
