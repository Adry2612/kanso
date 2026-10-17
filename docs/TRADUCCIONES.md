# Sistema de Traducciones (i18n) - Collectify

## 📋 Resumen

Este proyecto ahora tiene soporte completo de internacionalización (i18n) usando **next-intl**. Los usuarios pueden cambiar entre **Español** e **Inglés** en cualquier momento.

## 🌍 Idiomas Disponibles

- 🇪🇸 **Español (es)** - Idioma por defecto
- 🇬🇧 **English (en)**

## 🗂️ Estructura de Archivos

```
src/
├── i18n.ts                      # Configuración de next-intl
├── middleware.ts                # Middleware para detección de locale
├── locales/
│   ├── es.json                  # Traducciones en español
│   └── en.json                  # Traducciones en inglés
└── components/
    └── LanguageSwitcher.tsx     # Componente selector de idioma
```

## 🔧 Configuración

### 1. Instalación

La dependencia ya está instalada:

```bash
npm install next-intl
```

### 2. Archivos de Configuración

- **`src/i18n.ts`**: Configuración principal de next-intl
- **`src/middleware.ts`**: Maneja el enrutamiento por locale
- **`next.config.ts`**: Configurado con el plugin de next-intl

## 📝 Uso en Componentes

### Importar el hook de traducciones

```typescript
import { useTranslations } from "next-intl";
```

### Usar traducciones en un componente

```typescript
export default function MyComponent() {
  const t = useTranslations('common'); // 'common' es el namespace

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('loading')}</p>
    </div>
  );
}
```

### Múltiples namespaces

```typescript
export default function SearchPage() {
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{tCommon('loading')}</p>
    </div>
  );
}
```

## 🗃️ Namespaces Disponibles

Los archivos de traducción están organizados en los siguientes namespaces:

### `common`

Textos comunes usados en toda la aplicación:

- `loading`, `error`, `noResults`
- `search`, `favorites`, `history`
- `login`, `logout`, `welcome`

### `header`

Textos del componente Header:

- `search`, `favorites`, `history`, `logout`

### `search`

Textos de la página de búsqueda:

- `title`, `subtitle`, `placeholder`
- `resultsTitle`, `select`, `loading`
- `album`, `artist`

### `favorites`

Textos de la página de favoritos:

- `title`, `noFavorites`, `loading`, `error`
- `addFirst`

### `history`

Textos del histórico de recomendaciones:

- `title`, `noHistory`, `loading`, `error`
- `moods`

### `album`

Textos de la página de álbum:

- `tracklist`, `noTracks`, `loading`, `error`
- `addToFavorites`, `removeFromFavorites`
- `track`, `duration`, `artist`, `releaseDate`

### `modal`

Textos de modales:

- `close`, `confirm`, `cancel`, `save`
- `selectMood`, `success`, `savedToFavorites`
- `undo`, `viewCollection`, `addAnother`
- `relatedEmotions`, `listenOnSpotify`, `editEmotions`

### `init`

Textos de la página de inicio:

- `welcome`, `start`, `selectMood`
- `getRecommendation`

### `login`

Textos de login:

- `title`, `email`, `password`, `submit`
- `noAccount`, `createAccount`, `forgotPassword`

### `recommendation`

Textos de recomendaciones:

- `title`, `based`, `listenOn`, `spotify`
- `saveToFavorites`, `getAnother`

## 🔄 Cambiar de Idioma

### Usando el componente LanguageSwitcher

El componente `LanguageSwitcher` ya está integrado en el Header. Los usuarios pueden cambiar el idioma haciendo clic en los botones ES/EN.

### Programáticamente

```typescript
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

function MyComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (newLocale: string) => {
    const pathnameWithoutLocale = pathname.replace(/^\/(es|en)/, "") || "/";
    const newPathname =
      newLocale === "es"
        ? pathnameWithoutLocale
        : `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPathname);
  };

  // ...
}
```

## ➕ Agregar Nuevas Traducciones

### 1. Agregar al archivo español (`src/locales/es.json`)

```json
{
  "myNamespace": {
    "myKey": "Mi texto en español"
  }
}
```

### 2. Agregar al archivo inglés (`src/locales/en.json`)

```json
{
  "myNamespace": {
    "myKey": "My text in English"
  }
}
```

### 3. Usar en el componente

```typescript
const t = useTranslations('myNamespace');
// ...
<p>{t('myKey')}</p>
```

## 🎨 Páginas Traducidas

Todas las páginas principales están completamente traducidas:

- ✅ Header (navegación)
- ✅ Página de búsqueda
- ✅ Página de favoritos
- ✅ Página de histórico de recomendaciones
- ✅ Página de detalle de álbum
- ✅ Componente AlbumTracklist
- ✅ Modal de selección de álbum
- ✅ Modal de guardado exitoso

## 🔗 URLs con Locale

Las URLs ahora incluyen el prefijo de locale cuando es necesario:

- Español (default): `/search`, `/favorites`, `/albums/123`
- Inglés: `/en/search`, `/en/favorites`, `/en/albums/123`

## 🛠️ Buenas Prácticas

1. **Siempre usa traducciones para texto visible**: Nunca hardcodees texto en español o inglés directamente en los componentes.

2. **Organiza por namespaces**: Agrupa traducciones relacionadas en el mismo namespace.

3. **Nombres descriptivos**: Usa keys descriptivas como `noResultsFound` en lugar de `msg1`.

4. **Mantén sincronizados los archivos**: Asegúrate de que todas las keys existan en ambos idiomas.

5. **Reutiliza traducciones comunes**: Usa el namespace `common` para textos que se repiten en varios lugares.

## 🐛 Solución de Problemas

### El texto no cambia al cambiar de idioma

Verifica que:

1. El componente esté usando el hook `useTranslations`
2. La key existe en ambos archivos de traducción
3. El namespace es correcto

### Error "Messages are not available"

Asegúrate de que:

1. El layout raíz envuelve la aplicación con `NextIntlClientProvider`
2. Los archivos de traducción están en la ruta correcta (`src/locales/`)

### El locale no se detecta correctamente

Revisa que:

1. El middleware esté configurado correctamente
2. El matcher del middleware incluya todas las rutas necesarias

## 📚 Recursos

- [Documentación de next-intl](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

---

**Última actualización**: 27 de noviembre de 2025
