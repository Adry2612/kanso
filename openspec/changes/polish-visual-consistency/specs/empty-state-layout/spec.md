# Spec Delta

## Purpose

Define cómo se presentan los estados vacíos para que el mensaje y su acción queden centrados en el área de contenido y se lean igual en todas las pantallas de la aplicación.

## ADDED Requirements

### Requirement: Centrado de los estados vacíos

El sistema DEBE (MUST) centrar horizontalmente en el área de contenido los estados vacíos de pantalla, con un ancho máximo legible y separación respecto a la cabecera y las herramientas. El centrado DEBE (MUST) mantenerse en escritorio y en pantallas estrechas, sin desplazamiento horizontal, y DEBE (MUST) aplicarse tanto al vacío por falta de datos como al de filtros o búsquedas sin coincidencias.

#### Scenario: Historial sin recomendaciones

- **WHEN** la persona abre el historial y no tiene recomendaciones previas
- **THEN** el bloque con el icono, el título, la descripción y la acción aparece centrado en el área de contenido

#### Scenario: Historial sin coincidencias

- **WHEN** la persona aplica filtros en el historial y ninguna entrada coincide
- **THEN** el mensaje de «sin coincidencias» y la acción de limpiar filtros aparecen centrados en el área de contenido

#### Scenario: Novedades sin lanzamientos

- **WHEN** la persona abre novedades y no hay lanzamientos que mostrar
- **THEN** el mensaje que invita a seguir artistas aparece centrado en el área de contenido

#### Scenario: Artistas sin resultados o sin seguidos

- **WHEN** una búsqueda de artistas no devuelve resultados o la persona no sigue a ningún artista
- **THEN** el estado vacío correspondiente aparece centrado en el área de contenido

#### Scenario: Buscador sin resultados o sin consulta

- **WHEN** la búsqueda no devuelve resultados o la persona abre el buscador sin consulta activa
- **THEN** el bloque de estado vacío o de sugerencias aparece centrado en el área de contenido

#### Scenario: Inicio sin recomendaciones recientes

- **WHEN** el inicio no tiene recomendaciones recientes que mostrar
- **THEN** el bloque de estado vacío aparece centrado dentro de su tarjeta lateral

#### Scenario: Pantalla estrecha

- **WHEN** el estado vacío se muestra en un viewport de 320 a 1023 px
- **THEN** el bloque ocupa el ancho disponible con márgenes equilibrados y sin recortes ni desplazamiento horizontal
