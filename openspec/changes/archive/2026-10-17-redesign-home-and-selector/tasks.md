# Tasks

## 1. Iconos y datos

- [x] 1.1 Añadir `emoji` a cada actividad en `src/constants/activities.ts`
- [x] 1.2 Completar en `src/app/globals.css` los tokens que falten para el tema claro (superficies), sin romper el oscuro

## 2. Inicio y selector

- [x] 2.1 Reemplazar la fecha hardcodeada del inicio por la fecha actual (`Intl.DateTimeFormat` tras montar)
- [x] 2.2 Migrar el bloque a tokens del tema (tarjetas, textos, bordes, acentos) y usar emoji + etiqueta
- [x] 2.3 Quitar la paginación del selector y mostrar el catálogo completo en un grid adaptable
- [x] 2.4 Relegar la recomendación rápida a vía secundaria y dar el peso principal al panel de emoción/actividad
- [x] 2.5 Retirar la cita del lateral

## 3. Verificación

- [x] 3.1 `npx tsc --noEmit` y lint sin errores nuevos
- [x] 3.2 Comprobar en el navegador que inicio y selector se leen bien en tema claro y oscuro (contraste de las etiquetas)
- [x] 3.3 Comprobar que el flujo sigue funcionando: emoción/actividad → paso 2 → resultado, y la rápida → resultado
