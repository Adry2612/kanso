# Spec Delta

## ADDED Requirements

### Requirement: Estados vacíos centrados en el contenido

El sistema DEBE (MUST) centrar horizontalmente los estados vacíos de la colección en el área de contenido disponible, con un ancho máximo legible y separación suficiente respecto a la cabecera, las pestañas, el buscador y los chips. El centrado DEBE aplicarse tanto a «no hay discos en tu colección» como a «no hay discos que coincidan», y DEBE mantenerse en escritorio y en pantallas estrechas sin pegar el bloque a los bordes.

#### Scenario: Colección vacía en escritorio

- **WHEN** la persona sin álbumes guardados abre la colección en una pantalla ancha
- **THEN** el mensaje «no hay discos en tu colección» aparece centrado en el área de contenido y no alineado al borde izquierdo

#### Scenario: Filtro sin coincidencias

- **WHEN** la persona aplica filtros y ningún disco coincide
- **THEN** el mensaje «no hay discos que coincidan» aparece centrado en el área de contenido, con su acción de limpiar filtros visible

#### Scenario: Pantalla estrecha

- **WHEN** la persona abre cualquiera de los dos estados vacíos en un viewport de 320 a 1023 px
- **THEN** el bloque ocupa el ancho disponible con márgenes equilibrados, sin recortes ni desplazamiento horizontal

#### Scenario: Estado vacío de pendientes

- **WHEN** la persona abre la pestaña de pendientes sin elementos o con una búsqueda sin coincidencias
- **THEN** su estado vacío también aparece centrado en el área de contenido

### Requirement: Remarcado de las emociones filtradas en las cápsulas

Cuando el filtro rápido de emoción esté activo, el sistema DEBE (MUST) remarcar en verde, en las cápsulas de emoción de cada disco, las emociones que coinciden con el filtro, y DEBE acompañar el color con una señal adicional perceptible, como un borde, un mayor peso o un indicador, para no depender únicamente del color. Las emociones no filtradas DEBEN conservar su estilo neutro. Sin filtro de emoción, todas las cápsulas DEBEN mostrarse neutras.

#### Scenario: Emoción filtrada en vista de cuadrícula

- **WHEN** la persona activa una emoción en el selector rápido y la colección se muestra en cuadrícula
- **THEN** en cada disco que contiene esa emoción su cápsula aparece remarcada en verde y con la señal adicional, mientras las demás emociones del disco siguen neutras

#### Scenario: Varias emociones filtradas

- **WHEN** la persona activa dos o más emociones en el selector rápido
- **THEN** se remarcan todas las cápsulas del disco cuya emoción está entre las filtradas

#### Scenario: Vista de lista

- **WHEN** la persona usa la vista de lista con un filtro de emoción activo
- **THEN** el remarcado se aplica igualmente a las cápsulas de cada fila

#### Scenario: Limpiar el filtro

- **WHEN** la persona pulsa «Todas» o limpia los filtros
- **THEN** todas las cápsulas de emoción vuelven al estilo neutro

#### Scenario: Señal no cromática

- **WHEN** la persona no distingue el verde o usa un lector de pantalla
- **THEN** la emoción filtrada se distingue por el borde o el peso además del color, y su estado activo se anuncia como parte del filtro aplicado
