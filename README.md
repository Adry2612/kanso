# 🎵 Kanso

Una aplicación web moderna para descubrir, coleccionar y organizar álbumes musicales basándose en estados de ánimo, con integración a Spotify y Firebase.

## 🚀 Características

### 🎯 Descubrimiento de Música

- **Recomendaciones por Estado de Ánimo**: Selecciona entre 5 estados de ánimo (Feliz, Triste, Energético, Relajado, Melancólico) para recibir recomendaciones personalizadas
- **Búsqueda Avanzada**: Busca álbumes por nombre, artista o año
- **Detalles de Álbumes**: Visualización completa con lista de canciones, año de lanzamiento y portada
- **Gradiente Dinámico**: Fondos que se adaptan automáticamente a los colores de la portada del álbum

### ❤️ Gestión de Favoritos

- **Colección Personal**: Guarda tus álbumes favoritos vinculados a estados de ánimo
- **Sistema de Ordenamiento**: 7 opciones de ordenamiento
  - Más recientes / Más antiguos (por fecha de guardado)
  - Alfabéticamente (A-Z / Z-A)
  - Por artista
  - Por año de lanzamiento (ascendente / descendente)
- **Filtros Avanzados**: Filtra por estados de ánimo (5 opciones) y géneros (6 opciones)
- **Vista Agrupada**: Visualización automática agrupada según el método de ordenamiento seleccionado
- **Indicadores Visuales**: Badges y chips que muestran los filtros activos

### 🌐 Internacionalización

- Soporte completo para Español e Inglés
- Sistema de traducciones con soporte para claves anidadas
- Cambio de idioma en tiempo real

### 🔐 Autenticación

- Integración con Firebase Authentication
- Inicio de sesión con Google
- Gestión de sesiones persistentes

## 🛠️ Tecnologías

- **Frontend**: Next.js 15.4.7 con React 19
- **Styling**: Tailwind CSS 4.1.14
- **Estado**: React Query (@tanstack/react-query)
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **API**: Spotify Web API
- **Extracción de Colores**: fast-average-color
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React, React Icons

## 📋 Requisitos Previos

- Node.js 20.x o superior
- npm, yarn, pnpm o bun
- Cuenta de Firebase
- Credenciales de Spotify Developer

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/kanso.git
cd kanso
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Spotify
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=tu_client_secret
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
kanso/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── albums/            # Páginas de detalle de álbumes
│   │   ├── api/               # API Routes
│   │   ├── favorites/         # Página de favoritos
│   │   ├── init/              # Flujo de onboarding
│   │   ├── login/             # Autenticación
│   │   └── search/            # Búsqueda de álbumes
│   ├── components/            # Componentes reutilizables
│   │   ├── BaseModal.tsx      # Modal base
│   │   ├── SortModal.tsx      # Modal de ordenamiento
│   │   ├── FilterModal.tsx    # Modal de filtros
│   │   └── ...
│   ├── context/               # Contextos de React
│   │   ├── AuthContext.tsx    # Autenticación
│   │   └── I18nContext.tsx    # Internacionalización
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilidades y servicios
│   └── locales/               # Archivos de traducción
├── models/                    # Modelos TypeScript
├── services/                  # Servicios externos (Spotify)
└── public/                    # Archivos estáticos
```

## 🎨 Componentes Destacados

### Sistema de Modales Reutilizables

- **BaseModal**: Componente base con portal rendering, backdrop, bloqueo de scroll
- **SortModal**: Modal específico para ordenamiento con 7 opciones
- **FilterModal**: Modal de filtros multi-selección con moods y géneros

### Agrupación Inteligente

Los álbumes se agrupan automáticamente según el método de ordenamiento:

- Por artista → Agrupa por nombre de artista
- Alfabético → Agrupa por primera letra
- Por año → Agrupa por año de lanzamiento o guardado

## 🚢 Despliegue

### Build de producción

```bash
npm run build
npm start
```

### Desplegar en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/kanso)

La forma más sencilla de desplegar es usar [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

> **Inicio de sesión con Google en producción:** añade el dominio de Vercel
> (`tu-proyecto.vercel.app`) y, si lo hay, tu dominio propio en
> **Firebase Console → Authentication → Settings → Authorized domains**.
> Sin ese paso, `signInWithPopup` falla con `auth/unauthorized-domain`.
> Los dominios de preview de Vercel cambian en cada despliegue y no admiten
> comodines: para probar el login en un preview hay que autorizar ese dominio
> concreto o usar el de producción.

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con Turbopack
- `npm run build` - Crea el build de producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está protegido por derechos de autor.

## 👤 Autor

**Adrian**

---

Hecho con ❤️ usando Next.js y Spotify API
