# Spec Delta

## ADDED Requirements

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
