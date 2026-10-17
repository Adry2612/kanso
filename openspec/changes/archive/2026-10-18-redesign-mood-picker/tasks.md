# Tasks

## 1. Catálogo y agrupación

- [x] 1.1 Añadir a `src/constants/moods.ts` los metadatos de agrupación (4 familias) sin tocar claves, etiquetas ni emoji
- [x] 1.2 Añadir las etiquetas de familia a `src/locales/es.json` y `src/locales/en.json` (namespace `moodGroups`)
- [x] 1.3 Las actividades no necesitan agrupación: se muestran en una única fila de opciones

## 2. Componente único

- [x] 2.1 Reescribir `src/components/MoodSelector.tsx`: rejilla agrupada, sin carrusel (fuera flechas, rueda, puntos y `activeIndex`)
- [x] 2.2 Sustituir el boolean `compact` por la variante de densidad `size` y unificar el aspecto con el de inicio
- [x] 2.3 Lenguaje visual **A** (refinar los emoji): pastillas con menos caja, jerarquía clara y selección en mint con marca `✓`
- [x] 2.4 Accesibilidad: `aria-pressed`, `role="group"` con nombre, contraste en ambos temas, transición y escala bajo `prefers-reduced-motion`

## 3. Integración

- [x] 3.1 Usar el componente unificado en `StartPage` (emoción/actividad) y en `SaveAlbumModal`
- [x] 3.2 `FilterModal` reutiliza el mismo componente (comparte marca y agrupación)
- [x] 3.3 Simplificar el flujo del modal a claves canónicas: `MoodBubble` resuelve la etiqueta traducida (antes mostraba la clave en crudo)
- [x] 3.4 Mantener intactos los flujos: paso 2 (formato/etiquetas), recomendación rápida y estados vacíos

## 4. Verificación

- [x] 4.1 `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores
- [x] 4.2 Comprobado que las 15 emociones están agrupadas en 4 familias, sin duplicados ni huérfanas, y que los grupos están traducidos en es y en
- [x] 4.3 La home renderiza el selector agrupado (Energía, Calma, Afecto, Melancolía)
- [ ] 4.4 Revisión visual del usuario

## Notas

- La agrupación es **presentación**: el catálogo y las claves no cambian, así que no hay migración de datos ni riesgo en favoritos e historial.
- Al pasar el modal a claves canónicas se corrige de paso que las burbujas mostraran la clave (`joy`) en lugar de la etiqueta (`Alegría`).

## Fuera de alcance

- Reducir el número de emociones (requiere migración de datos: otro cambio).
