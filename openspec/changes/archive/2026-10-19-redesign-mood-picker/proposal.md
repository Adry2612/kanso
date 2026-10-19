# Propuesta cerrada — absorbida por `redesign-carrousel-feelings`

> **Estado: CERRADO (2026-10-19).** No se implementa por separado.
>
> Este plan se escribió antes de saber cómo debía resolverse el selector. Se
> implementó una primera versión (pastillas + agrupación por familias) que **no
> gustó** y se revirtió en el commit `08fb61b`.
>
> El objetivo —un único selector, con todas las emociones a la vez y una marca
> coherente— lo asume **`redesign-carrousel-feelings`**, que además descarta lo
> que aquí falló: no agrupa por familias, mantiene el emoji con protagonismo y
> conserva el flujo de dos pasos.
>
> El feedback de la vuelta rechazada está recogido en
> `openspec/changes/redesign-carrousel-feelings/design.md`, sección
> *Feedback a no repetir*, para que no se pierda al archivar este change.
>
> Se archiva como registro de la decisión. No debe implementarse: su contenido
> está superado.

## Qué se descartó de este plan

- La **agrupación en 4 familias** con rótulos: alargaba el bloque y no ayudaba a
  recorrerlo.
- Las **pastillas** en lugar de cajas con emoji protagonista.
- El selector único **sin carrusel** para el inicio: el inicio adoptó un carrusel
  accesible, y la rejilla se conserva donde la spec la exige (modal y filtro).
