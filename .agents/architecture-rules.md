---
name: frontend-architecture-rules
description: Reglas estrictas de arquitectura Frontend (React/Next.js) aplicando separación de responsabilidades, custom hooks headless, servicios y utilidades.
---

# Reglas de Arquitectura y Separación de Responsabilidades

Cuando generes, modifiques o refactorices código en este proyecto (Kanjo), aplica siempre el principio de **Separación de Responsabilidades (SoC)** y el patrón **Headless Custom Hook**:

1. **Vistas / Componentes (`components/`):**
   - Deben ser componentes puros dedicados exclusivamente al marcado visual (JSX/TSX y Tailwind).
   - Prohibido incluir llamadas directas a APIs, lógica de negocio compleja, efectos (`useEffect`) pesados o cálculos matemáticos dentro de la vista.

2. **Lógica de Negocio (`hooks/`):**
   - Toda la gestión de estado (`useState`, `useReducer`), efectos y manejadores de eventos (`handlers`) debe aislarse en Custom Hooks (ej. `useAlbumForm.ts`).
   - El hook se encarga de orquestar y devuelve únicamente el estado y las acciones limpias que la vista necesita consumir.

3. **Servicios (`services/`):**
   - Toda comunicación con el exterior (API de Spotify, llamadas a Firestore o bases de datos) debe residir en funciones dedicadas dentro de la capa de servicios.

4. **Utilidades y Matemáticas (`utils/`):**
   - Los cálculos matemáticos, transformaciones de datos o formateadores (como el análisis de _audio features_ de audio) deben ser funciones puras ubicadas en carpetas `utils`.

5. **Tipado Estricto (`types/`):**
   - Cada estructura de datos debe contar con su `interface` o `type` de TypeScript formalmente definido.
