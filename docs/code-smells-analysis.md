# Code Smells Analysis — context-ai-front

## Metodología

- **Fecha:** 15 de febrero de 2026
- **Scope:** `src/` (componentes, stores, API clients, hooks, constants, types)
- **Criterios:** Martin Fowler (*Refactoring*, 2nd ed.) + React anti-patterns (Kent C. Dodds, Josh Comeau)
- **Herramientas:** Inspección manual de ~50 archivos + ESLint/SonarJS

---

## 🚨 Code Smells Identificados

---

### CS-01 · Duplicate Code — `getAccessToken` duplicada — Severidad: 🔴

**Ubicación:**
- `src/lib/api/client.ts:39-66`
- `src/lib/api/knowledge.api.ts:65-74`

**Código:**

```typescript
// client.ts — implementación completa con timeout y abort signal
async function getAccessToken(
  timeout = TOKEN_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  try {
    const response = await fetch('/api/auth/token', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return null;
    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to get access token:', error);
    return null;
  }
}
```

```typescript
// knowledge.api.ts — implementación simplificada sin timeout
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/token');
    if (!response.ok) return null;
    const data: { accessToken: string } = await response.json();
    return data.accessToken;
  } catch {
    return null;
  }
}
```

**Problema:** Dos implementaciones distintas de la misma función `getAccessToken`. La versión de `knowledge.api.ts` no usa timeout, lo que la hace vulnerable a bloqueos indefinidos. Ambas hacen `fetch('/api/auth/token')` con lógica diferente de manejo de errores.

**Impacto:**
- Bugs silenciosos: arreglar un bug en una no lo arregla en la otra.
- Inconsistencia de comportamiento: `client.ts` tiene timeout de 5s; `knowledge.api.ts` no tiene timeout.
- Violación de DRY (Don't Repeat Yourself).

**Refactor sugerido:**
`knowledge.api.ts` debería usar `apiClient` de `client.ts` en lugar de `fetch` manual. Eliminar la función `getAccessToken` local y reemplazar las llamadas directas a `fetch` con `apiClient.get/post/delete`.

---

### CS-02 · Duplicate Code — `getUserRole()` triplicada — Severidad: 🔴

**Ubicación:**
- `src/components/dashboard/app-sidebar.tsx:54-60`
- `src/components/chat/ChatHeader.tsx:29-35`

**Código:**

```typescript
// app-sidebar.tsx — función interna del componente
const getUserRole = (): string => {
  const roles = session?.user?.roles;
  if (roles && Array.isArray(roles) && roles.length > 0) {
    return roles[0];
  }
  return 'user';
};
```

```typescript
// ChatHeader.tsx — función standalone
function getUserRole(session: ReturnType<typeof useSession>['data']): string {
  const roles = session?.user?.roles;
  if (roles && Array.isArray(roles) && roles.length > 0) {
    return roles[0];
  }
  return 'user';
}
```

**Problema:** La misma lógica de extracción de rol copiada en dos componentes con firmas levemente diferentes (una recibe `session` como parámetro, otra lo lee del closure).

**Impacto:**
- Si la estructura de roles cambia (p.ej., priorización por peso), hay que actualizar en N sitios.
- Riesgo de divergencia silenciosa entre componentes.

**Refactor sugerido:**
Extraer a un utility/hook centralizado:

```typescript
// src/lib/utils/get-user-role.ts
export function getUserRole(roles?: string[]): string {
  if (roles && Array.isArray(roles) && roles.length > 0) {
    return roles[0];
  }
  return 'user';
}
```

---

### CS-03 · Duplicate Code — `UPLOAD_ROLES` y role-check pattern duplicados — Severidad: 🟡

**Ubicación:**
- `src/components/documents/DocumentsView.tsx:61-62`
- `src/components/knowledge/KnowledgeUpload.tsx:23`
- `src/components/chat/ChatHeader.tsx:24`
- `src/components/dashboard/app-sidebar.tsx:65`

**Código:**

```typescript
// DocumentsView.tsx
const UPLOAD_ROLES = ['admin', 'manager'];
const hasUploadPermission = userRoles.some((role) => UPLOAD_ROLES.includes(role));

// KnowledgeUpload.tsx
const UPLOAD_ROLES = ['admin', 'manager'];
const hasUploadPermission = userRoles.some((role) => UPLOAD_ROLES.includes(role));

// ChatHeader.tsx
const ADMIN_ROLES = ['admin', 'manager'];
const isAdmin = ADMIN_ROLES.includes(userRole);

// app-sidebar.tsx
const canViewDocuments = ['admin', 'manager'].includes(userRole);
const canViewSectors = userRole === 'admin';
```

**Problema:** El patrón de chequeo de roles está disperso en 4+ archivos con arrays inline. La definición de "quién puede qué" no tiene una fuente única de verdad.

**Impacto:**
- Si se agrega un rol (p.ej., `editor`), hay que buscar todos los archivos manualmente.
- Cada archivo decide su propia política de acceso sin consistencia.

**Refactor sugerido:**
Centralizar roles y permisos en un archivo de constantes/utilidades:

```typescript
// src/constants/permissions.ts
export const ROLES = { ADMIN: 'admin', MANAGER: 'manager', USER: 'user' } as const;
export const CAN_UPLOAD = [ROLES.ADMIN, ROLES.MANAGER];
export const CAN_VIEW_DOCUMENTS = [ROLES.ADMIN, ROLES.MANAGER];
export const CAN_VIEW_SECTORS = [ROLES.ADMIN];

export function hasPermission(userRoles: string[], allowedRoles: string[]): boolean {
  return userRoles.some((role) => allowedRoles.includes(role));
}
```

---

### CS-04 · Duplicate Code — `TYPE_ICONS` y `STATUS_BADGE_VARIANTS` duplicados — Severidad: 🟡

**Ubicación:**
- `src/components/documents/DocumentsView.tsx:52-58, 80-87`
- `src/components/documents/DocumentDetailDialog.tsx:27-32, 35-42`

**Código:**

```typescript
// Exactamente idénticos en ambos archivos:
type IconComponent = typeof FileText;
const TYPE_ICONS: Record<string, IconComponent> = {
  PDF: FileText,
  MARKDOWN: FileCode,
  TEXT: FileText,
  URL: LinkIcon,
};

type BadgeVariant = 'default' | 'secondary' | 'destructive';
const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  PROCESSED: 'default',
  COMPLETED: 'default',
  PROCESSING: 'secondary',
  PENDING: 'secondary',
  FAILED: 'destructive',
};
```

**Problema:** Dos copias exactas de los mismos mappings en archivos del mismo dominio (`documents/`).

**Impacto:** Si se añade un nuevo `SourceType` (p.ej., `DOCX`), es fácil olvidar actualizar uno de los dos archivos.

**Refactor sugerido:**
Extraer a `src/constants/document-mappings.ts` o a un barrel `src/components/documents/constants.ts`.

---

### CS-05 · Duplicate Code — `formatDate` / `formatDisplayDate` duplicadas — Severidad: 🟡

**Ubicación:**
- `src/components/documents/DocumentsView.tsx:100-107`
- `src/components/documents/DocumentDetailDialog.tsx:56-62`

**Código:**

```typescript
// DocumentsView.tsx
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// DocumentDetailDialog.tsx
function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
```

**Problema:** Funciones idénticas con distinto nombre. Además, ambas hardcodean `'en-US'`, ignorando el locale activo del usuario (la app soporta `en`/`es`).

**Impacto:**
- Código duplicado que se mantendrá por separado.
- Bug de i18n: los usuarios con locale `es` ven las fechas en inglés.

**Refactor sugerido:**
Crear `src/lib/utils/format-date.ts` que use el locale de `next-intl`:

```typescript
export function formatDate(dateStr: string, locale = 'en'): string {
  return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}
```

---

### CS-06 · Duplicate Code — `FILE_TYPE_MAP` y lógica de detección de tipo de archivo — Severidad: 🟡

**Ubicación:**
- `src/components/documents/DocumentsView.tsx:67-71, 112-121`
- `src/components/knowledge/KnowledgeUpload.tsx:29-33, 71-116`

**Código:**

```typescript
// Idéntico en ambos archivos:
const FILE_TYPE_MAP: Record<string, SourceType> = {
  'application/pdf': 'PDF',
  'text/markdown': 'MARKDOWN',
  'text/plain': 'MARKDOWN',
};
const ACCEPTED_MIME_TYPES = '.pdf,.md,.txt';

// DocumentsView.tsx — detectSourceType
function detectSourceType(file: File): SourceType {
  const mimeType = FILE_TYPE_MAP[file.type];
  if (mimeType) return mimeType;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'md' || ext === 'txt') return 'MARKDOWN';
  return 'PDF';
}

// KnowledgeUpload.tsx — handleFileChange (misma lógica inline)
const detectedType = FILE_TYPE_MAP[selectedFile.type];
if (!detectedType) {
  const ext = selectedFile.name.split('.').pop()?.toLowerCase();
  if (ext === 'md' || ext === 'txt') { ... setSourceType('MARKDOWN'); ... }
  if (ext === 'pdf') { ... setSourceType('PDF'); ... }
}
```

**Problema:** Tres constantes (`FILE_TYPE_MAP`, `ACCEPTED_MIME_TYPES`, `MAX_FILE_SIZE`) y la lógica de detección de tipo están copiadas en dos componentes de upload.

**Impacto:** Un nuevo tipo (p.ej., `DOCX`) requiere cambios en dos sitios.

**Refactor sugerido:**
Extraer a `src/lib/utils/file-detection.ts`:

```typescript
export function detectSourceType(file: File): SourceType { ... }
export const ACCEPTED_MIME_TYPES = '.pdf,.md,.txt';
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
```

---

### CS-07 · Long Method / Large Component — `DocumentsView` (626 líneas) — Severidad: 🔴

**Ubicación:** `src/components/documents/DocumentsView.tsx:128-525`

**Problema:** El componente `DocumentsView` tiene ~400 líneas de JSX + lógica con 15 variables de estado (`useState`) y maneja múltiples responsabilidades:
1. Listado y filtrado de documentos
2. Formulario de upload con drag & drop
3. Diálogos de vista/eliminación
4. Estado de carga, error, vacío

**Impacto:**
- Difícil de testear unitariamente (cada test necesita mock de todo).
- Alto acoplamiento: cambiar el upload puede romper el listado.
- Difícil de leer/navegar (~530 líneas en un solo archivo).

**Refactor sugerido:**
Extraer responsabilidades:
1. `useDocumentList()` — custom hook para fetch + filter
2. `useDocumentUpload()` — custom hook para upload state + submit
3. `UploadDialog` — componente separado
4. `DocumentFilters` — componente separado

---

### CS-08 · Data Clumps — Estado de upload agrupado en variables sueltas — Severidad: 🟡

**Ubicación:** `src/components/documents/DocumentsView.tsx:144-150`

**Código:**

```typescript
const [uploadFile, setUploadFile] = useState<File | null>(null);
const [uploadTitle, setUploadTitle] = useState('');
const [uploadSectorId, setUploadSectorId] = useState('');
const [isUploading, setIsUploading] = useState(false);
const [uploadError, setUploadError] = useState<string | null>(null);
const [isDragOver, setIsDragOver] = useState(false);
```

**Problema:** 6 variables de estado que siempre viajan juntas y se resetean juntas (líneas 260-264, 275-281). Es un *Data Clump* clásico.

**Impacto:**
- `handleDialogChange` necesita resetear 5 campos manualmente.
- Fácil olvidar resetear un campo en un nuevo handler.

**Refactor sugerido:**
Usar `useReducer` o un custom hook `useUploadForm()` que encapsule el estado completo y el reset como una sola acción.

---

### CS-09 · Primitive Obsession — Roles como strings sin tipo — Severidad: 🟡

**Ubicación:** Múltiples archivos (ver CS-03)

**Código:**

```typescript
// Aparece en 4+ archivos:
const isAdmin = ['admin', 'manager'].includes(userRole);
const canViewDocuments = ['admin', 'manager'].includes(userRole);
const canViewSectors = userRole === 'admin';
const hasUploadPermission = userRoles.some((role) => UPLOAD_ROLES.includes(role));
```

**Problema:** Los roles se manejan como `string` sin tipo union o enum. No hay autocompletado ni protección contra typos como `'adm1n'`.

**Impacto:**
- Un typo compila sin error y falla silenciosamente en runtime.
- No hay exhaustividad: si se agrega un rol nuevo, TypeScript no avisa.

**Refactor sugerido:**

```typescript
export type UserRole = 'admin' | 'manager' | 'user';
export function getUserRole(roles?: string[]): UserRole {
  const first = roles?.[0];
  if (first === 'admin' || first === 'manager') return first;
  return 'user';
}
```

---

### CS-10 · Magic Numbers / Strings — Locale hardcodeado `'en-US'` — Severidad: 🟡

**Ubicación:**
- `src/components/documents/DocumentsView.tsx:102`
- `src/components/documents/DocumentDetailDialog.tsx:57`

**Código:**

```typescript
return date.toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
});
```

**Problema:** El locale `'en-US'` está hardcodeado en una app que soporta inglés y español (`messages/en.json`, `messages/es.json`). Los usuarios hispanohablantes verán "Feb 15, 2026" en vez de "15 feb 2026".

**Impacto:** Experiencia de usuario inconsistente para usuarios de locale `es`.

**Refactor sugerido:** Usar el locale de `next-intl` o `Intl.DateTimeFormat` con el locale activo del navegador.

---

### CS-11 · Hardcoded Strings (i18n incompleto) — `ErrorState` y `ErrorBoundary` — Severidad: 🟡

**Ubicación:**
- `src/components/chat/ErrorState.tsx:23-44`
- `src/components/shared/ErrorBoundary.tsx:81-82, 89-94`
- `src/components/chat/ChatContainer.tsx:38`
- `src/components/documents/DocumentsView.tsx:197`

**Código:**

```typescript
// ErrorState.tsx — diccionarios sin i18n
const ERROR_TITLES = {
  [ErrorType.NETWORK]: 'Network Error',
  [ErrorType.AUTH]: 'Authentication Error',
  // ...
};
const ERROR_DESCRIPTIONS = {
  [ErrorType.NETWORK]: 'Unable to connect to the server...',
  // ...
};

// ErrorBoundary.tsx
<h2>Something went wrong</h2>
<Button>Try Again</Button>
<Button>Reload Page</Button>

// ChatContainer.tsx
setError('User session not found. Please sign in again.');

// DocumentsView.tsx
setUploadError('File too large. Maximum size is 10MB.');
```

**Problema:** Strings en inglés hardcodeados en componentes. La app usa `next-intl` para i18n pero estos strings no pasaron por la traducción.

**Impacto:** Usuarios con locale `es` ven errores en inglés, rompiendo la experiencia i18n.

**Refactor sugerido:** Mover todos los strings estáticos a `messages/en.json` y `messages/es.json`, usar `useTranslations()`.

---

### CS-12 · Feature Envy — `knowledge.api.ts` reimplementa `client.ts` — Severidad: 🔴

**Ubicación:** `src/lib/api/knowledge.api.ts:65-201`

**Código:**

```typescript
// knowledge.api.ts hace fetch manual en lugar de usar apiClient
export const knowledgeApi = {
  listDocuments: async (sectorId?: string): Promise<KnowledgeSourceDto[]> => {
    const token = await getAccessToken(); // ← su propio getAccessToken
    const response = await fetch(`${getBaseUrl()}/knowledge/documents${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to load documents: ...`);
    }
    return response.json();
  },
  // ... 4 métodos más con el mismo patrón
};
```

**Versus:**

```typescript
// chat.api.ts y sector.api.ts usan apiClient correctamente
export const chatApi = {
  sendMessage: async (dto: ChatQueryDto) => {
    return apiClient.post<ChatResponseDto>('/interaction/query', dto);
  },
};
```

**Problema:** `knowledge.api.ts` implementa su propia infraestructura HTTP (auth, headers, error handling, base URL) en vez de usar `apiClient` que ya tiene todo eso resuelto. Excepto `uploadDocument` que necesita `multipart/form-data`, los otros 3 métodos podrían usar `apiClient` directamente.

**Impacto:**
- Si se cambia la lógica de auth/retry/timeout en `client.ts`, `knowledge.api.ts` no se beneficia.
- Doble mantenimiento de error handling.
- Bug real: `knowledge.api.ts` no tiene timeout → puede bloquear indefinidamente.

**Refactor sugerido:**
Migrar `listDocuments`, `getDocumentDetail` y `deleteSource` a `apiClient.get/delete`. Solo `uploadDocument` necesita `fetch` manual por el `FormData`.

---

### CS-13 · Temporary Field — `SECTORS` hardcodeados como "MVP temporal" — Severidad: ⚠️

**Ubicación:** `src/constants/sectors.ts:1-18`

**Código:**

```typescript
/**
 * Temporary hardcoded sectors for MVP — will come from API in future phases
 */
export const SECTORS = [
  { id: '440e8400-e29b-41d4-a716-446655440000', name: 'Human Resources' },
  { id: '440e8400-e29b-41d4-a716-446655440001', name: 'Engineering' },
  { id: '440e8400-e29b-41d4-a716-446655440002', name: 'Sales' },
] as const;
```

**Problema:** El propio comentario indica que es temporal, pero `SUGGESTED_QUESTION_KEYS` en `suggested-questions.ts` depende de estos IDs hardcodeados. Si el backend genera otros UUIDs, las preguntas sugeridas no matchean.

**Impacto:** Fragilidad alta: si los IDs del backend cambian, las preguntas sugeridas dejan de funcionar silenciosamente (fallback a `default`).

**Refactor sugerido:** Usar nombres de sector como clave en vez de UUIDs, o cargar las preguntas sugeridas desde la API/configuración.

---

### CS-14 · Middle Man — `chat/MarkdownRenderer.tsx` es solo re-export — Severidad: ⚠️

**Ubicación:** `src/components/chat/MarkdownRenderer.tsx:1-7`

**Código:**

```typescript
/**
 * Re-export from shared location.
 * MarkdownRenderer was moved to @/components/shared/MarkdownRenderer
 * because it's used by both chat and document features.
 */
export { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
```

**Problema:** Este archivo no hace nada excepto re-exportar. Es un *Middle Man* puro (indirección sin valor).

**Impacto:** Un nivel extra de indirección. Confusión: ¿cuál `MarkdownRenderer` usar?

**Refactor sugerido:** Eliminar el archivo y actualizar los imports que lo referencian para que importen directamente de `@/components/shared/MarkdownRenderer`.

---

### CS-15 · Duplicate Code — Drag & Drop pattern copiado — Severidad: ⚠️

**Ubicación:**
- `src/components/documents/DocumentsView.tsx:209-227`
- `src/components/knowledge/KnowledgeUpload.tsx:119-139`

**Código:**

```typescript
// Patrón idéntico en ambos:
const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragOver(false);
  const droppedFile = e.dataTransfer.files[0];
  if (droppedFile) handleFileSelect(droppedFile);
}, [handleFileSelect]);

const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragOver(true);
}, []);

const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  setIsDragOver(false);
}, []);
```

**Problema:** Tres handlers de drag & drop son idénticos en dos componentes.

**Impacto:** Si se necesita mejorar el drag & drop (p.ej., validación al soltar, soporte multi-archivo), hay que hacerlo en dos sitios.

**Refactor sugerido:**
Crear hook `useFileDrop()`:

```typescript
export function useFileDrop(onFile: (file: File) => void) {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDrop = useCallback(...);
  const handleDragOver = useCallback(...);
  const handleDragLeave = useCallback(...);
  return { isDragOver, handleDrop, handleDragOver, handleDragLeave };
}
```

---

### CS-16 · Repeated Boilerplate — Zustand hook accessors en stores — Severidad: ⚠️

**Ubicación:**
- `src/stores/chat.store.tsx:141-233` (13 hooks)
- `src/stores/sector.store.tsx:219-293` (12 hooks)
- `src/stores/user.store.tsx:128-163` (5 hooks)

**Código:**

```typescript
// Se repite 30 veces con la misma estructura:
export const useConversationId = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.conversationId);
};

export const useIsLoading = () => {
  const store = useChatStoreContext();
  return useStore(store, (state) => state.isLoading);
};

// ... 28 más idénticos en estructura
```

**Problema:** 30 hooks con la misma estructura de 3 líneas, solo cambiando el selector. Alto ratio de boilerplate vs lógica.

**Impacto:** Más líneas que mantener, pero bajo riesgo de bugs. Más ruido que peligro.

**Refactor sugerido:**
Crear un factory helper (opcional, trade-off de legibilidad):

```typescript
function createSelector<T>(selector: (state: ChatState) => T) {
  return () => {
    const store = useChatStoreContext();
    return useStore(store, selector);
  };
}
export const useConversationId = createSelector((s) => s.conversationId);
export const useIsLoading = createSelector((s) => s.isLoading);
```

---

### CS-17 · Dead Code — `Navbar.tsx` referencia rutas inexistentes — Severidad: ⚠️

**Ubicación:** `src/components/shared/Navbar.tsx:44-61, 125-133`

**Código:**

```typescript
// routes.ts define profile y settings:
profile: (locale: string) => `/${locale}/profile`,
settings: (locale: string) => `/${locale}/settings`,

// Navbar.tsx navega a estas rutas, pero no existen páginas en app/:
<Link href={routes.profile(locale)}>Profile</Link>
<Link href={routes.settings(locale)}>Settings</Link>

// También linkea a Knowledge, pero la app usa Documents ahora:
<Link href={routes.knowledge(locale)}>Knowledge</Link>
```

**Problema:** El `Navbar` tiene links a `/profile`, `/settings` y `/knowledge` pero solo existen páginas para `/dashboard`, `/chat`, `/documents`, `/sectors`. La app ahora usa `AppSidebar` como navegación principal.

**Impacto:** El Navbar podría ser dead code si la app transicionó al layout con sidebar. Los links rotos causan 404s.

**Refactor sugerido:** Verificar si `Navbar` sigue usándose. Si solo se usa en landing, quitar los links de Profile/Settings/Knowledge. Si no se usa en absoluto, eliminarlo.

---

### CS-18 · Long Parameter List — `EmptyState` feature cards repetidos — Severidad: ⚠️

**Ubicación:** `src/components/chat/EmptyState.tsx:51-87`

**Código:**

```typescript
{/* Feature highlights — 3 bloques casi idénticos */}
<div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
    <MessageSquare className="h-6 w-6 text-blue-600" />
  </div>
  <h3 className="mb-2 font-semibold text-gray-900">{t('features.naturalConversations.title')}</h3>
  <p className="text-sm text-gray-600">{t('features.naturalConversations.description')}</p>
</div>

{/* Repetido 2 veces más con solo el ícono y color distintos */}
```

**Problema:** Tres feature cards con la misma estructura, solo cambian ícono, color y keys de traducción. Es un patrón repetido sin abstracción.

**Impacto:** Bajo riesgo, pero añadir un cuarto feature requiere copiar 8 líneas.

**Refactor sugerido:**
Crear un array de features y mapear:

```typescript
const FEATURES = [
  { key: 'naturalConversations', icon: MessageSquare, color: 'blue' },
  { key: 'contextAware', icon: Sparkles, color: 'purple' },
  { key: 'sourceCitations', icon: MessageSquare, color: 'green' },
] as const;
```

---

### CS-19 · Hardcoded String — Error de upload sin i18n — Severidad: ⚠️

**Ubicación:** `src/components/documents/DocumentsView.tsx:197`

**Código:**

```typescript
setUploadError('File too large. Maximum size is 10MB.');
```

**Problema:** String de error de validación hardcodeado en inglés mientras el componente ya usa `useTranslations('documents')` para otros strings.

**Impacto:** Usuarios con locale `es` ven este error en inglés.

**Refactor sugerido:** `setUploadError(t('uploadDialog.fileTooLarge'))` y agregar la key a los archivos de traducción.

---

## 📊 Resumen por Categoría

| Categoría | Cantidad | Severidad Alta (🔴) | Severidad Media (🟡) | Severidad Baja (⚠️) |
|-----------|----------|---------------------|----------------------|---------------------|
| 🔄 Behavioral (Duplicación) | 8 | 2 | 4 | 2 |
| 🏗 Structural (Tamaño/Complejidad) | 3 | 1 | 1 | 1 |
| 💾 Data (Primitivos/Magic) | 3 | 0 | 2 | 1 |
| 🎯 OO (Feature Envy/Middle Man) | 2 | 1 | 0 | 1 |
| 🔄 i18n Incompleto | 2 | 0 | 1 | 1 |
| 📦 Boilerplate | 1 | 0 | 0 | 1 |
| **Total** | **19** | **4** | **8** | **7** |

---

## 🎯 Priorización de Refactoring

### Prioridad 1 — Alto impacto, bajo esfuerzo
1. **CS-01**: Eliminar `getAccessToken` duplicada en `knowledge.api.ts` → usar `apiClient`
2. **CS-02 + CS-03**: Centralizar `getUserRole()` y constantes de roles/permisos
3. **CS-04 + CS-05**: Extraer constantes y utilidades compartidas de `documents/`

### Prioridad 2 — Alto impacto, esfuerzo medio
4. **CS-12**: Migrar `knowledge.api.ts` a usar `apiClient`
5. **CS-07 + CS-08**: Refactorizar `DocumentsView` extrayendo hooks y sub-componentes
6. **CS-11**: Completar i18n en `ErrorState`, `ErrorBoundary`, `ChatContainer`

### Prioridad 3 — Mejora continua
7. **CS-09**: Tipar roles con union type
8. **CS-10**: Usar locale dinámico para formateo de fechas
9. **CS-06 + CS-15**: Extraer lógica de file detection y drag & drop a hooks
10. **CS-14**: Eliminar re-export innecesario de `MarkdownRenderer`
11. **CS-17**: Limpiar `Navbar` de rutas inexistentes

---

## 📝 Notas

- Los archivos bajo `src/components/ui/` (shadcn/ui) no se analizaron ya que son código generado.
- El hook `use-toast.ts` usa un patrón global con listeners — es código estándar de shadcn/ui.
- El `ErrorBoundary` usa class component por requerimiento de React (no hay hook equivalente).
- Los tests (`__tests__/`) se excluyeron del análisis de code smells de producción.
