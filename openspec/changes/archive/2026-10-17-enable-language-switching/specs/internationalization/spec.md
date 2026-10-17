# Spec Delta

## MODIFIED Requirements

### Requirement: Cambio de idioma

El sistema DEBE ofrecer en Ajustes un selector de idioma (Español / English) y, al cambiarlo, DEBE actualizar de inmediato todos los textos traducidos de la interfaz, incluida la propia página de Ajustes.

#### Scenario: Cambio a inglés

- **WHEN** la persona elige "English" en el selector de idioma de Ajustes
- **THEN** el sistema actualiza al inglés los textos traducidos de toda la interfaz, incluidos los de Ajustes, sin recargar la página

#### Scenario: Cambio a español

- **WHEN** la persona elige "Español" tras haber elegido inglés
- **THEN** la interfaz vuelve a mostrarse en español

## ADDED Requirements

### Requirement: Idioma del documento

El sistema DEBE aplicar el idioma activo al atributo `lang` del documento, de modo que coincida con la interfaz mostrada.

#### Scenario: Atributo lang del documento

- **WHEN** la persona cambia el idioma de la interfaz
- **THEN** el atributo `lang` del documento pasa a reflejar el idioma activo
