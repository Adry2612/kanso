# Spec Delta

## ADDED Requirements

### Requirement: Verificación de identidad en la API

Toda ruta de la API que lea o escriba datos de una persona DEBE exigir un ID token de Firebase válido y DEBE derivar el identificador de usuario del propio token, sin confiar en ningún identificador enviado por el cliente.

#### Scenario: Petición sin token

- **WHEN** llega una petición a una ruta protegida sin un ID token válido
- **THEN** el sistema responde con un error de no autorizado y no toca ningún dato

#### Scenario: Identificador del cliente distinto del real

- **WHEN** una persona autenticada envía un `userId` que no es el suyo
- **THEN** el sistema ignora ese identificador y opera siempre sobre el usuario del token

#### Scenario: Token válido

- **WHEN** llega una petición con un ID token válido
- **THEN** el sistema atiende la petición sobre los datos del usuario del token

### Requirement: Acceso a los datos solo a través de la API

El acceso directo del cliente a Firestore DEBE estar denegado; los datos DEBEN servirse únicamente a través de la API con privilegios.

#### Scenario: Lectura directa desde el cliente

- **WHEN** un cliente intenta leer o escribir Firestore directamente
- **THEN** la operación es denegada por las reglas

#### Scenario: Lectura legítima de un flujo de la app

- **WHEN** un flujo necesita datos que antes leía del cliente
- **THEN** el sistema los obtiene a través de la API, no directamente de Firestore
