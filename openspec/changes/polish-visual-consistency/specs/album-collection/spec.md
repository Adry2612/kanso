# Spec Delta

## ADDED Requirements

### Requirement: Prioridad de las emociones filtradas en las cápsulas

Cuando el filtro rápido de emoción esté activo, el sistema DEBE (MUST) mostrar primero, en la lista de cápsulas de cada álbum, las emociones que coinciden con el filtro, conservando el orden original del resto. El contador de emociones no visibles DEBE (MUST) contar solo las que quedan fuera. Sin filtro de emoción, el orden DEBE (MUST) ser el original y todas las cápsulas DEBEN (MUST) mostrarse neutras.

#### Scenario: Emoción filtrada fuera del límite visible

- **WHEN** un álbum tiene más emociones que el límite de cápsulas visibles y la emoción filtrada no estaba entre las primeras
- **THEN** esa emoción aparece como primera cápsula y una de las que antes se veían pasa al contador de no visibles

#### Scenario: Vista de cuadrícula

- **WHEN** la persona activa una emoción con la colección en cuadrícula
- **THEN** cada álbum muestra primero la cápsula de esa emoción, con su remarcado, dentro del límite de dos cápsulas

#### Scenario: Vista de lista

- **WHEN** la persona activa una emoción con la colección en lista
- **THEN** cada fila muestra primero la cápsula de esa emoción, con su remarcado, dentro del límite de tres cápsulas

#### Scenario: Varias emociones filtradas

- **WHEN** la persona activa dos o más emociones
- **THEN** las cápsulas coincidentes aparecen antes que las demás, conservando entre ellas el orden original del álbum

#### Scenario: Contador de no visibles

- **WHEN** la lista priorizada deja emociones fuera del límite visible
- **THEN** el contador `+N` refleja únicamente las emociones que no se muestran

#### Scenario: Sin filtro de emoción

- **WHEN** no hay ninguna emoción activa
- **THEN** las cápsulas conservan el orden original del álbum y su estilo neutro
