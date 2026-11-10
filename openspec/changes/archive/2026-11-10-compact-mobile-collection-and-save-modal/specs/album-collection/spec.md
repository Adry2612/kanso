# Spec Delta

## ADDED Requirements

### Requirement: Tarjetas de colección compactas en pantallas estrechas

En pantallas estrechas, el sistema DEBE limitar la información superpuesta a la portada de cada tarjeta de la cuadrícula a una emoción y el contador de emociones restantes, manteniendo la acción de escuchar y la portada reconocible.

#### Scenario: Álbum con varias emociones

- **WHEN** la persona ve en la cuadrícula móvil un álbum con dos o más emociones
- **THEN** la tarjeta muestra una sola emoción y un contador «+N» con las restantes

#### Scenario: Álbum con una emoción

- **WHEN** el álbum tiene exactamente una emoción
- **THEN** la tarjeta muestra esa emoción y ningún contador

#### Scenario: Álbum sin emociones

- **WHEN** el álbum no tiene emociones asociadas
- **THEN** la portada no muestra cápsulas de emoción ni un contador vacío

#### Scenario: Portada reconocible

- **WHEN** la tarjeta muestra contenido superpuesto en una pantalla estrecha
- **THEN** el velo inferior no oculta la portada y la acción de escuchar sigue siendo visible y pulsable

#### Scenario: Emociones completas fuera de la cuadrícula

- **WHEN** la persona abre la ficha del álbum o cambia a la vista de lista
- **THEN** puede consultar todas las emociones del álbum, no solo la mostrada en la tarjeta

#### Scenario: Lectura accesible de la tarjeta

- **WHEN** un lector de pantalla recorre una tarjeta con emociones resumidas
- **THEN** anuncia la emoción visible y cuántas emociones más tiene el álbum

### Requirement: Encabezado y filtros compactos en pantallas estrechas

En pantallas estrechas, el sistema DEBE compactar el encabezado de la colección, el bloque de búsqueda, orden, filtro y vista, y los filtros de emoción, de forma que los primeros discos aparezcan antes en la pantalla.

#### Scenario: Encabezado compacto

- **WHEN** la persona abre la colección en una pantalla estrecha
- **THEN** el título, el subtítulo y las estadísticas ocupan menos altura que en escritorio y siguen siendo legibles

#### Scenario: Filtros de emoción en una fila

- **WHEN** hay más emociones de las que caben en el ancho disponible
- **THEN** los filtros se presentan en una sola fila desplazable horizontalmente en lugar de ocupar varias filas

#### Scenario: Todas las emociones accesibles

- **WHEN** la persona desplaza la fila de filtros de emoción
- **THEN** puede alcanzar todas las emociones y la opción de mostrar todas

#### Scenario: Discos antes en la pantalla

- **WHEN** la colección tiene álbumes y se abre en un móvil de 390 × 844 px
- **THEN** la primera fila de discos aparece dentro de la vista inicial, sin necesidad de desplazarse

#### Scenario: Escritorio intacto

- **WHEN** la colección se abre con 1024 px o más
- **THEN** el encabezado y los filtros conservan su composición actual

## MODIFIED Requirements

### Requirement: Asistente de guardado en pasos

El sistema DEBE pedir primero si el álbum va a la colección o a pendientes. Si elige la colección, DEBE guiar el guardado en tres pasos —emociones, actividades y formato— y, dentro del paso de formato, DEBE ofrecer «Formato» e «Idioma y género» como dos secciones del mismo paso, con un pie idéntico en ambas. Si elige pendientes, DEBE guardarlo sin recorrer esos pasos.

#### Scenario: Navegación entre pasos

- **WHEN** la persona avanza desde el paso de emociones
- **THEN** el sistema solicita actividades y después el formato de colección

#### Scenario: Formato obligatorio

- **WHEN** la persona intenta guardar sin ningún formato seleccionado
- **THEN** el sistema mantiene deshabilitada la acción de guardar

#### Scenario: Destino pendientes

- **WHEN** la persona elige «Por escuchar» como destino
- **THEN** el sistema guarda el álbum en pendientes sin pedir emociones, actividades, formato ni etiquetas

#### Scenario: Destino colección

- **WHEN** la persona elige «A la colección» como destino
- **THEN** el sistema comienza el asistente por el paso de emociones

#### Scenario: Dos secciones en el paso de formato

- **WHEN** la persona llega al paso de formato
- **THEN** ve un selector con «Formato» e «Idioma y género», la sección de formato activa por defecto y la selección actual resumida en cada opción

#### Scenario: Pie estable entre secciones

- **WHEN** la persona cambia entre «Formato» e «Idioma y género»
- **THEN** el pie sigue mostrando «← Atrás» y «Guardar álbum» sin acciones de navegación intermedias

#### Scenario: Selección conservada al cambiar de sección

- **WHEN** la persona elige idioma y género, vuelve a «Formato» y regresa a «Idioma y género»
- **THEN** la selección se conserva, se refleja en el resumen del selector y se guarda con el álbum

#### Scenario: Formato visible sin desplazamiento

- **WHEN** el paso de formato se abre en una pantalla estrecha (390 × 650 o 320 × 568)
- **THEN** el selector de secciones, el título y los cuatro formatos se ven sin desplazarse
