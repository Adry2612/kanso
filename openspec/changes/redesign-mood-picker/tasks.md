# Tasks

> **Estado: PAUSADO.** El rediseño se implementó, no gustó y se revirtió
> (commit `08fb61b`). El plan queda pendiente y las tareas vuelven a estar sin
> marcar. Ver el feedback en `design.md` antes de reintentarlo.

## 0. Aprendido de la primera vuelta (no repetir)

- [ ] 0.1 No agrupar con rótulos de familia: alargó el bloque y no ayudó a recorrerlo
- [ ] 0.2 Mantener las **cajas** (emoji grande + etiqueta), no pastillas
- [ ] 0.3 Que no ocupe más a lo alto que la rejilla anterior
- [ ] 0.4 No perder protagonismo del emoji ni la facilidad de recorrerlo de un vistazo
- [ ] 0.5 Evitar que quede plano/soso: hace falta más carácter, no menos

## 1. Catálogo y agrupación

- [ ] 1.1 Añadir a `src/constants/moods.ts` los metadatos de agrupación (4 familias) sin tocar claves, etiquetas ni emoji
- [ ] 1.2 Añadir las etiquetas de familia a `src/locales/es.json` y `src/locales/en.json` (namespace `moodGroups`)
- [ ] 1.3 Las actividades no necesitan agrupación: se muestran en una única fila de opciones

## 2. Componente único

- [ ] 2.1 Reescribir `src/components/MoodSelector.tsx`: rejilla agrupada, sin carrusel (fuera flechas, rueda, puntos y `activeIndex`)
- [ ] 2.2 Sustituir el boolean `compact` por la variante de densidad `size` y unificar el aspecto con el de inicio
- [ ] 2.3 Lenguaje visual: **mantener las cajas** con el emoji con protagonismo (la versión en pastillas se rechazó)
- [ ] 2.4 Accesibilidad: `aria-pressed`, `role="group"` con nombre, contraste en ambos temas, transición y escala bajo `prefers-reduced-motion`

## 3. Integración

- [ ] 3.1 Usar el componente unificado en `StartPage` (emoción/actividad) y en `SaveAlbumModal`
- [ ] 3.2 `FilterModal` reutiliza el mismo componente (comparte marca y agrupación)
- [ ] 3.3 Simplificar el flujo del modal a claves canónicas: `MoodBubble` resuelve la etiqueta traducida (antes mostraba la clave en crudo)
- [ ] 3.4 Mantener intactos los flujos: paso 2 (formato/etiquetas), recomendación rápida y estados vacíos

## 4. Verificación

- [ ] 4.1 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
- [ ] 4.2 Comprobar que las 15 emociones están agrupadas, sin duplicados ni huérfanas, y que los grupos están traducidos en es y en
- [ ] 4.3 La home renderiza el selector
- [ ] 4.4 Revisión visual del usuario (imprescindible: la vuelta anterior se rechazó aquí)

## Notas

- La agrupación es **presentación**: el catálogo y las claves no cambian, así que no hay migración de datos ni riesgo en favoritos e historial.
- Al pasar el modal a claves canónicas se corrige de paso que las burbujas mostraran la clave (`joy`) en lugar de la etiqueta (`Alegría`).

## Fuera de alcance

- Reducir el número de emociones (requiere migración de datos: otro cambio).
