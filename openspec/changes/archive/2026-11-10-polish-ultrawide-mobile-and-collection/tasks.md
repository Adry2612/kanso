# Tasks

## 1. Fondo continuo y composición adaptativa

- [x] 1.1 Mover el sombreado de tema a una capa de viewport a sangre completa, con variantes clara y oscura, y verificar a 2560 px en ambos temas que no aparece ninguna costura ni franja al hacer scroll.
- [x] 1.2 Sacar los degradados de portada de la ficha de álbum y del resultado de recomendación fuera del contenedor de 1440 px y verificar a 2560 y 3440 px que cubren todo el ancho sin corte.
- [x] 1.3 Introducir los tramos de ancho máximo (1440 / 1600 / 1760 / 1920 px) y ajustar los gutters, verificando en 1440, 1600, 1920 y 2560 px que no hay desplazamiento horizontal ni saltos raros en los bordes.
- [x] 1.4 Añadir las columnas adicionales en las rejillas de tarjetas (colección, búsqueda, artistas, novedades e historial) para 1600 y 2200 px, verificando con suficientes elementos que las filas se reparten sin tarjetas deformadas.
- [x] 1.5 Revisar que los bloques de texto conservan sus medidas máximas y que el panel lateral abierto y colapsado sigue funcionando a 1920 px o más, verificando ambos estados en el navegador.

## 2. Estados vacíos y emociones filtradas en la colección

- [x] 2.1 Centrar `CollectionEmptyState` en el área de contenido con un wrapper de altura moderada y verificar la colección vacía, el filtro sin coincidencias y la pestaña de pendientes en escritorio y a 320 px.
- [x] 2.2 Pasar las emociones activas del filtro a los badges de las tarjetas y filas y remarcar en verde solo las coincidentes, verificando una emoción, varias y el estado sin filtro en cuadrícula y lista.
- [x] 2.3 Añadir al badge filtrado una señal no cromática (borde, peso o indicador) y un texto accesible traducido, verificando el contraste en ambos temas y que el lector de pantalla anuncia el filtro activo.
- [x] 2.4 Añadir las claves de traducción necesarias en `src/locales/es.json` y `en.json` y verificar que no queda ningún texto hardcodeado ni falta una traducción.

## 3. Invitación a añadir el primer disco

- [x] 3.1 Exponer en `useHomeStart` el número de álbumes y el estado de carga/error de la colección reutilizando la petición existente, verificando en la pestaña de red que no se duplica la llamada.
- [x] 3.2 Distinguir en el inicio entre colección vacía, colección sin recomendaciones y error de carga, verificando que solo el primer caso muestra la invitación al primer disco y que la acción abre la búsqueda.
- [x] 3.3 Añadir a `useRecommendation` el estado `collectionEmpty` y tratar el resultado vacío por actividad como `noMatch` en lugar de error, verificando colección vacía, sin coincidencias y fallo técnico.
- [x] 3.4 Mostrar en `RecomendationPage` la invitación al primer disco cuando la colección esté vacía y mantener el estado sin coincidencias cuando sí haya colección, verificando ambos flujos y sus traducciones.

## 4. Acceso móvil y sesión de invitado

- [x] 4.1 Configurar Google con `prompt: "select_account"`, usar redirección en pantallas estrechas y ampliar los códigos de cancelación, verificando con TypeScript que el flujo de escritorio sigue usando la ventana emergente.
- [x] 4.2 Consumir `getRedirectResult` al montar la pantalla de acceso y manejar éxito, error y cancelación, verificando en un navegador móvil que el selector de cuenta se abre y que sin cuenta elegida no se inicia ninguna sesión.
- [x] 4.3 Crear la marca de entrada explícita como invitado, escribirla en `signInAsGuest` y borrarla al cerrar sesión, verificando que se conserva al recargar la pestaña y desaparece al abrir una nueva.
- [x] 4.4 Añadir `GuestSessionGuard` al layout para llevar a la bienvenida a un invitado restaurado que abra una ruta privada, verificando `/home` restaurado, entrada explícita, recarga, nueva pestaña y cuenta real.
- [x] 4.5 Hacer que una cuenta real que abra `/` continúe a `/home` y que una sesión anónima permanezca en la bienvenida, verificando ambos casos y que la prueba como invitado reutiliza la sesión existente.
- [x] 4.6 Revisar que el cierre de sesión de invitado limpia la marca y devuelve a `/`, verificando también que el acceso por correo y el registro siguen funcionando.

## 5. Aplicación instalable sin chrome

- [x] 5.1 Crear `public/manifest.webmanifest` con nombre Kanso, `start_url: "/"`, `display: "standalone"`, colores y el logo de 512×512 como icono `any` y `maskable`, verificando que el JSON es válido y que los iconos existen con el tamaño declarado.
- [x] 5.2 Declarar el manifiesto y los metadatos de app iOS en `layout.tsx`, verificando en el HTML generado que aparecen `manifest`, `apple-mobile-web-app-capable` y el título de la app.
- [x] 5.3 Probar la instalación en un entorno HTTPS (preview o producción) y verificar que al abrir desde el icono no aparecen la barra de rutas ni los botones del navegador, mientras que en una pestaña normal el chrome sigue visible.
- [x] 5.4 Documentar en `docs/ARCHITECTURE.md` el manifiesto, el modo `standalone` y la limitación de la pestaña normal, verificando que la documentación coincide con los archivos entregados.

## 6. Integración y regresión

- [x] 6.1 Ejecutar `npm run lint` y `npm run build` y verificar que terminan sin errores nuevos.
- [x] 6.2 Recorrer inicio, colección, álbum, recomendación e historial a 320, 390, 768, 1024, 1440, 1600, 1920, 2560 y 3440 px en ambos temas, verificando fondo continuo, centrado y ausencia de scroll horizontal.
- [x] 6.3 Probar el flujo de acceso completo: correo, Google en escritorio, Google en móvil, cancelación, invitado nuevo, invitado restaurado, cuenta real y cierre de sesión, verificando que no se entra en la app sin una elección explícita.
- [x] 6.4 Validar el cambio con `openspec validate polish-ultrawide-mobile-and-collection --strict` y revisar que specs, diseño y tareas siguen siendo coherentes con lo implementado.

## Workflow follow-up

- Archivar el cambio cuando la revisión del proyecto esté satisfecha.
- Verificar el resultado archivado y que las specs principales recogen los deltas.
