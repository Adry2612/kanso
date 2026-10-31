# Spec Delta

## Purpose

Permite ampliar la portada de un álbum a pantalla completa y apreciarla con una respuesta sutil al hover, sin arrastre, con una salida clara y sin perder el contexto de la ficha.

## ADDED Requirements

### Requirement: Apertura del visor desde la portada

El sistema DEBE (MUST) abrir un visor a pantalla completa al pulsar la portada en el detalle de un álbum y en el resultado de una recomendación. La portada DEBE (MUST) pasar de su posición en la ficha al centro y ampliarse sobre un fondo oscurecido, y el resto de la interfaz NO DEBE (MUST NOT) recibir interacción mientras el visor esté abierto.

#### Scenario: Apertura desde el detalle de álbum

- **WHEN** la persona pulsa la portada en `/albums/{albumId}`
- **THEN** la portada se amplía y se centra sobre un fondo oscuro, y la ficha queda bloqueada detrás

#### Scenario: Apertura desde una recomendación

- **WHEN** la persona pulsa la portada en el resultado de una recomendación
- **THEN** se abre el mismo visor con la misma animación y el mismo comportamiento

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica `prefers-reduced-motion: reduce`
- **THEN** la portada aparece centrada y ampliada de forma instantánea, sin animación de expansión

### Requirement: Invitación a ampliar sin giro

La portada de la ficha DEBE (MUST) indicar que se puede ampliar con `cursor: zoom-in` y un brillo tenue. NO DEBE (MUST NOT) rotar, inclinarse ni desplazarse al pasar el puntero, para no confundir la invitación con el paralaje del visor.

#### Scenario: Hover sin giro

- **WHEN** la persona pasa el puntero sobre la portada antes de abrir el visor
- **THEN** la portada puede mostrar un brillo tenue, pero no gira, se inclina ni se desplaza

### Requirement: Contenido del visor

El visor DEBE (MUST) mostrar únicamente la portada ampliada, conservando su relación de aspecto y sin recortarla ni deformarla, además del control de cierre. NO DEBE (MUST NOT) mostrar metadatos, acciones de colección, reproducción ni controles adicionales.

#### Scenario: Solo la portada

- **WHEN** el visor está abierto
- **THEN** solo se ve la portada ampliada y el control de cierre, sin título, artistas ni botones de acción

#### Scenario: Relación de aspecto

- **WHEN** la portada es cuadrada o rectangular
- **THEN** se muestra completa, sin recortes ni distorsión, ajustada al espacio disponible

### Requirement: Respuesta al hover de la portada ampliada

La portada ampliada NO DEBE (MUST NOT) arrastrarse ni desplazarse con clic o toque. Al pasar el puntero por encima, la portada DEBE (MUST) desplazarse unos píxeles hacia la dirección del puntero y volver a su posición al salir; el desplazamiento DEBE (MUST) ser sutil y la portada DEBE (MUST) quedar fija en su sitio, sin desalinearse. La página de fondo NO DEBE (MUST NOT) desplazarse mientras el visor esté abierto.

#### Scenario: Sin arrastre

- **WHEN** la persona pulsa sobre la portada ampliada y mueve el puntero
- **THEN** la portada no se desplaza siguiendo el gesto; solo responde al hover con un desplazamiento sutil

#### Scenario: Paralaje al hover

- **WHEN** la persona mueve el puntero sobre la portada ampliada
- **THEN** la portada se desplaza ligeramente hacia la dirección del puntero

#### Scenario: Posición fija

- **WHEN** la persona deja de mover el puntero o lo saca de la portada
- **THEN** la portada vuelve a su posición centrada y no queda desplazada

#### Scenario: Scroll de fondo bloqueado

- **WHEN** el visor está abierto
- **THEN** la página de fondo conserva su posición y no se desplaza al hacer scroll

### Requirement: Feedback visual del hover

Mientras el puntero se mueve sobre la portada ampliada, la portada DEBE (MUST) mostrar un brillo o una sombra que sigue al puntero y es más intenso que en reposo. Al sacar el puntero, el brillo DEBE (MUST) volver a su estado normal.

#### Scenario: Brillo al hover

- **WHEN** la persona mueve el puntero sobre la portada ampliada
- **THEN** la portada muestra un brillo o una sombra más intensos que en reposo y vuelve a la normalidad al salir

### Requirement: Cierre y accesibilidad del visor

El visor DEBE (MUST) cerrarse con `Esc`, con un clic o toque fuera de la imagen y con un botón de cerrar visible. DEBE (MUST) anunciarse como diálogo modal, atrapar el foco mientras está abierto, devolver el foco a la portada al cerrar y ofrecer una etiqueta accesible para la imagen y el cierre.

#### Scenario: Cierre con Escape

- **WHEN** la persona pulsa `Esc` con el visor abierto
- **THEN** el visor se cierra y la ficha vuelve a estar disponible

#### Scenario: Cierre con clic o toque fuera

- **WHEN** la persona pulsa fuera de la portada ampliada
- **THEN** el visor se cierra

#### Scenario: Cierre con el botón

- **WHEN** la persona pulsa el botón de cerrar
- **THEN** el visor se cierra y el foco vuelve a la portada que lo abrió

#### Scenario: Navegación por teclado

- **WHEN** la persona navega con el tabulador dentro del visor
- **THEN** el foco permanece dentro del diálogo y no alcanza la ficha de fondo
