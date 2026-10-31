# Spec Delta

## MODIFIED Requirements

### Requirement: Pestaña Por escuchar en la colección

La página de colección DEBE (MUST) ofrecer dos pestañas, «Colección» y «Por escuchar», y DEBE permitir cambiar entre ellas sin recargar la página. La pestaña activa DEBE quedar visualmente identificada.

#### Scenario: Cambio a pendientes

- **WHEN** la persona selecciona la pestaña «Por escuchar»
- **THEN** el sistema muestra la lista de álbumes pendientes y marca esa pestaña como activa

#### Scenario: Vuelta a la colección

- **WHEN** la persona selecciona la pestaña «Colección»
- **THEN** el sistema vuelve a mostrar la colección con sus ordenaciones y filtros habituales

#### Scenario: Herramientas compartidas

- **WHEN** la persona cambia entre pestañas
- **THEN** el sistema conserva el buscador, el conmutador de vista y la agrupación por fecha, y oculta los filtros propios de la colección en la pestaña de pendientes

### Requirement: Listado de álbumes pendientes

El sistema DEBE (MUST) listar los álbumes pendientes del usuario del más reciente al más antiguo, con portada, título, artistas y fecha de incorporación, en vista de cuadrícula o de lista, y DEBE mostrar estados de carga, lista vacía y error con reintento en lugar de quedarse cargando indefinidamente.

#### Scenario: Lista con álbumes pendientes

- **WHEN** la persona abre la pestaña «Por escuchar» y tiene álbumes pendientes
- **THEN** el sistema los muestra del más reciente al más antiguo con su portada, título, artistas y fecha, agrupados por fecha de incorporación

#### Scenario: Vista de lista

- **WHEN** la persona cambia la pestaña de pendientes a vista de lista
- **THEN** el sistema muestra cada pendiente como una fila compacta con portada, título, artistas y fecha

#### Scenario: Lista vacía

- **WHEN** la persona abre la pestaña «Por escuchar» y no tiene álbumes pendientes
- **THEN** el sistema muestra un estado vacío con un acceso a la búsqueda

#### Scenario: Error al cargar pendientes

- **WHEN** la carga de la lista de pendientes falla
- **THEN** el sistema muestra un estado de error con la opción de reintentar
