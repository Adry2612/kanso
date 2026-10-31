# Spec Delta

## Purpose

Define cómo se presentan los errores de pantalla y cómo se recupera una sesión que no se puede validar, para que el fallo sea legible, accionable y coherente con los estados vacíos.

## ADDED Requirements

### Requirement: Errores de pantalla centrados

El sistema DEBE (MUST) centrar horizontalmente en el área de contenido los errores de pantalla completa —incluida la frontera de error de ruta— con icono, título, descripción y acciones alineados al centro y un ancho máximo legible. Los errores inline de formularios y subsecciones DEBEN (MUST) conservar su formato de banner. El centrado DEBE (MUST) mantenerse de 320 a 2400 px y en ambos temas, sin desplazamiento horizontal.

#### Scenario: Error de una pantalla de datos

- **WHEN** falla la carga del historial, de la recomendación, de la colección o del detalle de un álbum
- **THEN** el bloque de error aparece centrado en el área de contenido con su icono, título, descripción y acción de reintento

#### Scenario: Error de ruta no controlado

- **WHEN** una pantalla lanza una excepción y se muestra la frontera de error de la aplicación
- **THEN** el mensaje, la explicación y el botón de reintento aparecen centrados, con el mismo lenguaje visual que el resto de errores de pantalla

#### Scenario: Error dentro de un formulario o subsección

- **WHEN** falla el guardado de un álbum, el cambio de un ajuste o una acción secundaria
- **THEN** el error conserva el formato de banner alineado al contexto donde se produjo, sin ocupar el centro de la pantalla

#### Scenario: Pantalla estrecha

- **WHEN** un error de pantalla se muestra en un viewport de 320 a 1023 px
- **THEN** el bloque ocupa el ancho disponible con márgenes equilibrados y sin recortes ni desplazamiento horizontal

### Requirement: Estado de sesión no validada

Cuando un token siga siendo rechazado después de refrescarlo, el sistema DEBE (MUST) mostrar un estado de error centrado que explique que no se pudo validar la sesión y ofrezca una acción explícita para iniciar sesión de nuevo. NO DEBE (MUST NOT) cerrar la sesión automáticamente ni mostrar el mensaje técnico del servidor en ese estado.

#### Scenario: Token rechazado de forma persistente

- **WHEN** el servidor rechaza el token incluso después de refrescarlo
- **THEN** la pantalla muestra un estado centrado con el motivo, una explicación y la acción «Iniciar sesión de nuevo»

#### Scenario: Fallo de red que impide validar la sesión

- **WHEN** la sesión no se puede validar por un problema de red o del verificador
- **THEN** el sistema muestra el mismo estado de sesión y mantiene la sesión guardada, sin expulsar a la persona

#### Scenario: Acción de reautenticación

- **WHEN** la persona pulsa «Iniciar sesión de nuevo»
- **THEN** el sistema la lleva a la pantalla de acceso conservando la intención de volver a la pantalla donde estaba

### Requirement: Mensajes amables y acción de recuperación

La interfaz NO DEBE (MUST NOT) renderizar mensajes técnicos devueltos por la API. Los errores reintentables DEBEN (MUST) mostrar una descripción traducida y una acción de reintento; los que no admiten reintento DEBEN (MUST) ofrecer una salida, como volver o iniciar sesión.

#### Scenario: Mensaje técnico de la API

- **WHEN** una pantalla recibe un error de autenticación o de red con texto interno
- **THEN** muestra copy traducido y nunca el texto literal del servidor

#### Scenario: Error reintentable

- **WHEN** el error puede resolverse repitiendo la petición
- **THEN** el estado incluye una acción de reintento visible y comprensible

#### Scenario: Error sin reintento útil

- **WHEN** repetir la petición no puede resolver el problema, como una sesión inválida
- **THEN** el estado ofrece la acción de recuperación adecuada en lugar de un reintento ciego

### Requirement: Anuncio accesible del error

Los estados de error DEBEN (MUST) anunciarse a las tecnologías de asistencia como alertas, sin mover el foco de forma inesperada. Cuando la única salida sea una acción de recuperación, el foco DEBE (MUST) poder alcanzarla con el teclado y su indicador visible DEBE (MUST) conservarse.

#### Scenario: Lector de pantalla

- **WHEN** aparece un error de pantalla
- **THEN** se anuncia como alerta con su título y descripción una sola vez

#### Scenario: Navegación por teclado

- **WHEN** la persona navega con el tabulador por el estado de error
- **THEN** alcanza la acción de reintento o de inicio de sesión con un foco visible
