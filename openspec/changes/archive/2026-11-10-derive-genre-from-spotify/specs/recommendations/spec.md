# Spec Delta

## ADDED Requirements

### Requirement: Filtro por género derivado

La recomendación DEBE (MUST) aceptar una rama de género y limitar los candidatos a los álbumes cuyo género derivado o etiqueta de género coincida. Si no hay candidatos para esa rama, DEBE (MUST) mostrarse el estado sin coincidencias.

#### Scenario: Recomendar por género

- **WHEN** la persona elige la rama `hip-hop` como filtro
- **THEN** la recomendación solo considera álbumes de esa rama

#### Scenario: Género combinado con emoción y formato

- **WHEN** la persona combina género, emoción y formato
- **THEN** se aplican los tres filtros antes de puntuar

#### Scenario: Sin álbumes de esa rama

- **WHEN** ningún álbum de la colección pertenece a la rama elegida
- **THEN** el sistema muestra el estado sin coincidencias
