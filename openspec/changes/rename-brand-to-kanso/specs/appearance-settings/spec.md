# Spec Delta

## MODIFIED Requirements

### Requirement: Colores desde tokens

El sistema DEBE definir sus colores con los tokens del tema (`var(--kanso-*)` y `var(--surface-*)`) y DEBE evitar valores de color fijos que dependan de un solo tema.

#### Scenario: Cambio de tema sin restos

- **WHEN** la persona cambia de tema
- **THEN** ninguna pantalla conserva colores pensados para el otro tema

## ADDED Requirements

### Requirement: Continuidad de las preferencias guardadas

El sistema DEBE conservar las preferencias que guarda en el navegador cuando sus
claves cambian de nombre, leyendo una vez la clave anterior si la nueva todavía
no existe y escribiendo a partir de entonces solo la nueva.

#### Scenario: Preferencias de una versión anterior

- **WHEN** una persona que había elegido tema oscuro o panel colapsado vuelve con las claves nuevas aún sin escribir
- **THEN** el sistema aplica su preferencia anterior y la guarda bajo la clave nueva

#### Scenario: Preferencias ya migradas

- **WHEN** la persona vuelve una segunda vez
- **THEN** el sistema lee la clave nueva y no consulta la anterior
