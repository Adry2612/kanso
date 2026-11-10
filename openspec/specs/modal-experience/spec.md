# modal-experience Specification

## Purpose
Define cómo se presentan los modales de la aplicación para que todos compartan un mismo lenguaje visual y una jerarquía de acciones predecible, respetando la identidad y el tema activos.

## Requirements

### Requirement: Shell visual único de los modales

El sistema DEBE presentar todos sus modales con un mismo shell visual: misma superficie y material, misma escala de radios, misma tipografía de título y un mismo botón de cierre, además de una estructura común de cabecera, cuerpo y acciones.

#### Scenario: Modal estándar

- **WHEN** la persona abre cualquier modal (ordenar, filtrar, guardar o editar un álbum, confirmación de éxito, álbum ya en la colección)
- **THEN** el modal usa el mismo shell visual que el resto

#### Scenario: Modal con cabecera de imagen

- **WHEN** un modal muestra una cabecera con imagen (hero)
- **THEN** el resto de su estructura (cuerpo, acciones y cierre) sigue el mismo shell que los modales sin hero

#### Scenario: Tema activo

- **WHEN** el tema es claro u oscuro
- **THEN** todos los modales usan las superficies y contrastes del tema activo

### Requirement: Jerarquía de acciones consistente

El sistema DEBE aplicar el mismo tratamiento visual a las acciones primaria, secundaria y destructiva en todos los modales.

#### Scenario: Acción primaria

- **WHEN** un modal ofrece una acción principal
- **THEN** usa el mismo estilo de acción primaria que el resto de modales

#### Scenario: Acción destructiva

- **WHEN** un modal ofrece una acción destructiva (por ejemplo, eliminar de la colección)
- **THEN** usa el mismo estilo de acción destructiva que el resto de modales, sin confundirse con la primaria

### Requirement: Contenido íntegro de los modales

El sistema DEBE evitar que el contenido de un modal se recorte: el cuerpo es la única región que se desplaza y las acciones principales permanecen visibles sin desplazar el panel.

#### Scenario: Contenido más alto que el panel

- **WHEN** el contenido de un modal supera la altura disponible en la pantalla
- **THEN** el cuerpo del modal se desplaza por dentro, el contenido se puede ver completo y ningún bloque queda cortado por el borde del panel

#### Scenario: Acciones siempre alcanzables

- **WHEN** un modal muestra acciones principales junto a contenido largo
- **THEN** las acciones siguen visibles o se alcanzan sin perder el cierre ni el resto de controles

#### Scenario: Contenido que cabe

- **WHEN** el contenido de un modal cabe en la altura disponible
- **THEN** el modal se muestra completo, sin desplazamiento interno y sin huecos vacíos desproporcionados

#### Scenario: Confirmación de guardado en un móvil estándar

- **WHEN** la confirmación de guardado muestra seis emociones relacionadas en un móvil de 390 × 650
- **THEN** el mensaje, las emociones y las acciones se ven completos sin desplazar el cuerpo

#### Scenario: Emociones relacionadas en la confirmación

- **WHEN** la confirmación de guardado muestra las emociones relacionadas
- **THEN** todas las cápsulas se ven completas dentro del modal, también en pantallas estrechas

### Requirement: Cabecera compacta del asistente de guardado en pantallas estrechas

El sistema DEBE reducir la cabecera del asistente de guardado en pantallas estrechas para reservar altura al contenido del paso, manteniendo la portada, el título y el artista reconocibles.

#### Scenario: Asistente en un móvil

- **WHEN** la persona abre el asistente de guardado en una pantalla estrecha
- **THEN** se presenta como una hoja inferior ajustada al contenido, con una tarjeta de identidad del álbum (portada, nombre y artista) y el cuerpo del paso sin huecos muertos

#### Scenario: Pantalla especialmente baja

- **WHEN** el alto visible baja por el teclado abierto o por el móvil en horizontal
- **THEN** la cabecera se compacta aún más y el contenido del paso gana ese espacio sin ocultar los controles

#### Scenario: Escritorio en horizontal

- **WHEN** el asistente se abre con 768 px o más
- **THEN** la foto del artista ocupa la columna izquierda, el formulario la derecha y el contenido cabe sin desplazarse en una ventana de 800 × 700
