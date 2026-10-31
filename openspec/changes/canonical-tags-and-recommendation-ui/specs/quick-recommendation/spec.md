# Spec Delta

## ADDED Requirements

### Requirement: Etiquetas canónicas en la recomendación rápida

La recomendación rápida DEBE (MUST) mostrar las etiquetas de idioma y género con su nombre traducido y enviar su clave canónica al pedir la recomendación, sin admitir texto libre.

#### Scenario: Etiqueta mostrada y enviada

- **WHEN** la persona elige la etiqueta de género `hip-hop` con la interfaz en inglés
- **THEN** la ve como «Hip-Hop» y la recomendación usa la clave `hip-hop`

#### Scenario: Cambio de idioma

- **WHEN** la persona cambia la interfaz de español a inglés
- **THEN** las etiquetas de la recomendación rápida se muestran en inglés sin cambiar su valor guardado

#### Scenario: Etiqueta heredada

- **WHEN** la colección tiene una etiqueta antigua como «Hip-Hop» o «hip hop»
- **THEN** el sistema la reconoce como `hip-hop` y la ofrece una sola vez
