# Spec Delta

## ADDED Requirements

### Requirement: Animación de carga del resultado

Mientras se calcula una recomendación, el espacio de la portada DEBE (MUST) mostrar una pila de portadas en abanico —varias portadas cuadradas abiertas en arco con una que se adelanta en ciclo— en lugar del esqueleto genérico. El estado DEBE (MUST) anunciarse como carga para lectores de pantalla y NO DEBE (MUST NOT) provocar saltos de maquetación al terminar.

#### Scenario: Carga en curso

- **WHEN** la persona espera el resultado de una recomendación
- **THEN** ve la pila de portadas animada ocupando el espacio de la portada

#### Scenario: Movimiento reducido

- **WHEN** el sistema operativo indica `prefers-reduced-motion: reduce`
- **THEN** la pila se muestra estática, sin ciclo de portadas

#### Scenario: Fin de la carga

- **WHEN** el resultado está disponible
- **THEN** la pila se sustituye por la ficha del álbum sin saltos de maquetación

#### Scenario: Anuncio accesible

- **WHEN** una persona usa un lector de pantalla durante la carga
- **THEN** el estado se anuncia como carga en curso
