# Spec Delta

## ADDED Requirements

### Requirement: Género derivado del artista

Al abrir el guardado de un álbum, el sistema DEBE (MUST) derivar el género de sus artistas vía Spotify, unirlo, mapearlo a una rama principal y proponerlo como etiqueta de género editable. El idioma NO DEBE (MUST NOT) derivarse de la API: sigue siendo una etiqueta manual. Si Spotify falla, el guardado DEBE (MUST) continuar sin género derivado.

#### Scenario: Relleno previo del género

- **WHEN** la persona abre el guardado de un álbum con artistas
- **THEN** el sistema propone la rama de género derivada, por ejemplo `latin hip hop` o `rap español` como `hip-hop`, y `powermetal` o `metalcore` como `metal`

#### Scenario: Edición del género

- **WHEN** la persona corrige o elimina la etiqueta de género propuesta
- **THEN** el sistema guarda su elección, no la derivada

#### Scenario: Spotify no responde

- **WHEN** la consulta de artistas falla o no devuelve géneros
- **THEN** el guardado continúa sin género derivado y la persona puede añadirlo manualmente

#### Scenario: Idioma manual

- **WHEN** se guarda un álbum
- **THEN** el idioma solo existe si la persona lo añade como etiqueta

### Requirement: Filtrado por rama de género

La colección DEBE (MUST) filtrar por ramas canónicas de género y tratar igual el género derivado y la etiqueta manual.

#### Scenario: Filtro por hip-hop

- **WHEN** la persona filtra por `hip-hop`
- **THEN** aparecen los álbumes cuya rama derivada o etiqueta de género sea `hip-hop`

#### Scenario: Filtro por metal

- **WHEN** la persona filtra por `metal`
- **THEN** aparecen los álbumes mapeados a `metal`, incluidos `powermetal` y `metalcore`

#### Scenario: Filtro combinado

- **WHEN** la persona combina género con emoción, formato u otra etiqueta
- **THEN** se aplican todos los filtros activos
