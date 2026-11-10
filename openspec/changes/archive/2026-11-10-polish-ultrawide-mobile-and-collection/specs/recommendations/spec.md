# Spec Delta

## ADDED Requirements

### Requirement: Invitación a añadir el primer disco

Cuando la persona no tenga ningún álbum en su colección, el sistema DEBE (MUST) sustituir los mensajes genéricos de falta de recomendaciones o de coincidencias por una invitación explícita a añadir su primer disco, con una acción que la lleve a la búsqueda. La invitación DEBE aparecer tanto en el inicio como en el resultado de recomendación cuando el vacío se deba a la inexistencia de colección, y NO DEBE mostrarse cuando la colección existe pero no hay historial o no hay coincidencias.

#### Scenario: Inicio sin colección

- **WHEN** la persona abre el inicio, no tiene álbumes guardados y no hay recomendaciones recientes
- **THEN** el bloque de recomendaciones recientes invita a añadir su primer disco a la colección y ofrece una acción que abre la búsqueda

#### Scenario: Inicio con colección pero sin recomendaciones

- **WHEN** la persona tiene álbumes guardados pero todavía no ha recibido recomendaciones
- **THEN** el inicio mantiene el mensaje genérico de recomendaciones y no afirma que la colección esté vacía

#### Scenario: Recomendación sin colección

- **WHEN** la persona llega al resultado de una recomendación sin ningún álbum en su colección
- **THEN** el sistema muestra la invitación a añadir su primer disco, con la acción de búsqueda, en lugar del estado genérico de emoción sin coincidencias

#### Scenario: Recomendación con colección sin coincidencias

- **WHEN** la persona tiene colección pero la emoción o los filtros elegidos no encuentran ningún álbum
- **THEN** se mantiene el estado sin coincidencias existente, con la emoción elegida y la acción de buscar un álbum que encaje

#### Scenario: No se puede determinar el estado de la colección

- **WHEN** la comprobación de la colección falla o todavía no ha terminado
- **THEN** el sistema no muestra la invitación al primer disco y conserva el mensaje genérico o de carga correspondiente

#### Scenario: Primer disco añadido

- **WHEN** la persona añade su primer álbum y vuelve al inicio o al resultado de recomendación
- **THEN** la invitación desaparece y se muestran las recomendaciones o los estados normales
