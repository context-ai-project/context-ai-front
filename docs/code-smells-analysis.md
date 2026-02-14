# Code Smells Analysis — Context.AI Frontend

## Metodología

| Campo | Detalle |
|-------|---------| 
| **Fecha** | 2026-02-13 |
| **Scope** | `src/` (components, stores, lib, hooks, app, types, constants) |
| **Criterios** | Martin Fowler (*Refactoring*, 2ª Ed.) + React antipatterns + Next.js best practices |
| **Herramientas** | Inspección manual línea por línea + ESLint/SonarJS (complementario) |
| **Revisor** | Code reviewer senior (análisis asistido por IA) |
| **Archivos analizados** | 40+ archivos de producción en `src/` |
| **Stack** | Next.js 16 (App Router), TypeScript 5, Zustand, TanStack Query, shadcn/ui, Auth0/NextAuth v5 |

---

## Resumen Ejecutivo

| Categoría | 🔴 Críticos | 🟡 Moderados | ⚠️ Menores | Total |
|-----------|:-----------:|:------------:|:----------:|:-----:|
| 🏗 Structural | 1 | 2 | 1 | 4 |
| 🔄 Behavioral | 2 | 3 | 1 | 6 |
| 🎯 Object-Oriented / React | 0 | 2 | 2 | 4 |
| 💾 Data | 1 | 2 | 1 | 4 |
| **Total** | **4** | **9** | **5** | **18** |

**Deuda técnica estimada:** ~16–22 horas de refactorización  
**Prioridad recomendada:** Abordar 🔴 Críticos primero, luego 🟡 Moderados en sprints sucesivos

---

## 🏗 STRUCTURAL — Code Smells Estructurales

### CS-01: Long Method — `jwt` callback en `auth.ts` con 66 líneas y múltiples responsabilidades — Severidad: 🔴

**Ubicación:** `src/auth.ts:34-101`

**Código:**

```typescript
async jwt({ token, account, profile }) {
  // 1. Persist OAuth tokens
  if (account) {
    token.accessToken = account.access_token;
    token.idToken = account.id_token;
  }
  // 2. Persist profile data
  if (profile) {
    token.picture = profile.picture;
    token.sub = profile.sub ?? undefined;
    token.email = profile.email ?? undefined;
    token.name = profile.name ?? undefined;

    // 3. Sync user with backend (fetch call + validation + error handling)
    if (account && profile.sub && profile.email && profile.name) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const syncUrl = `${apiUrl}/users/sync`;
        console.warn('[NextAuth] Syncing user with backend:', { ... });

        const internalApiKey = process.env.INTERNAL_API_KEY;
        if (!internalApiKey) {
          console.error('[NextAuth] INTERNAL_API_KEY is not configured');
          return token;
        }

        const response = await fetch(syncUrl, { ... });

        if (response.ok) {
          const rawData: unknown = await response.json();
          const parsed = userSyncResponseSchema.safeParse(rawData);
          if (parsed.success) {
            token.userId = parsed.data.id;
          } else {
            console.error('[NextAuth] Invalid /users/sync response:', ...);
          }
        } else {
          console.error('[NextAuth] Failed to sync user:', { ... });
        }
      } catch (error) {
        console.error('[NextAuth] Error syncing user:', error);
      }
    }
  }
  return token;
}
```

**Problema:** Este callback de 66 líneas tiene **3 responsabilidades distintas**: (1) persistir tokens OAuth, (2) mapear datos del perfil, (3) hacer una llamada HTTP al backend para sincronizar el usuario con manejo de errores complejo. El sync incluye validación con Zod, manejo de API key, y múltiples paths de error. Esto viola el principio de responsabilidad única.

**Impacto:**
- Extremadamente difícil de testear unitariamente (depende de `fetch`, `process.env`, schema Zod)
- Si se cambia la lógica de sync, se toca el callback core de autenticación — riesgo de regresión
- 6 `console.error`/`console.warn` inline — sin logging estructurado

**Refactor sugerido:**
- Extraer la sincronización a un módulo independiente:

```typescript
// lib/auth/sync-user.ts
export async function syncUserWithBackend(profile: Profile): Promise<string | null> {
  // ... toda la lógica de sync
}

// auth.ts — callback limpio
async jwt({ token, account, profile }) {
  if (account) { token.accessToken = account.access_token; }
  if (profile) {
    Object.assign(token, extractProfileData(profile));
    if (account) { token.userId = await syncUserWithBackend(profile); }
  }
  return token;
}
```

---

### CS-02: Large Component — `MarkdownRenderer` con 18 componentes inline dentro del JSX — Severidad: 🟡

**Ubicación:** `src/components/chat/MarkdownRenderer.tsx:24-181`

**Código:**

```typescript
export function MarkdownRenderer({ content, className, 'data-testid': dataTestId }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none', className)} data-testid={dataTestId}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => ( <h1 className="text-2xl font-bold text-gray-900" {...props}>{children}</h1> ),
          h2: ({ children, ...props }) => ( <h2 className="text-xl font-semibold text-gray-900" {...props}>{children}</h2> ),
          h3: ({ children, ...props }) => ( ... ),
          p: ({ children, ...props }) => ( ... ),
          ul: ({ children, ...props }) => ( ... ),
          ol: ({ children, ...props }) => ( ... ),
          li: ({ children, ...props }) => ( ... ),
          a: ({ href, children, ...props }) => ( ... ),
          code: ({ className, children, ...props }) => { /* 20 lines with language detection */ },
          blockquote: ({ children, ...props }) => ( ... ),
          table: ({ children, ...props }) => ( ... ),
          thead: ({ children, ...props }) => ( ... ),
          tbody: ({ children, ...props }) => ( ... ),
          th: ({ children, ...props }) => ( ... ),
          td: ({ children, ...props }) => ( ... ),
          hr: (props) => ( ... ),
          strong: ({ children, ...props }) => ( ... ),
          em: ({ children, ...props }) => ( ... ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

**Problema:** **18 componentes custom** definidos inline dentro del prop `components` de `ReactMarkdown`. Cada uno es un mini-componente con clases Tailwind hardcodeadas. El objeto `components` se **recrea en cada render** porque no está memoizado.

**Impacto:**
- 150+ líneas dedicadas solo a definiciones de componentes custom — difícil escanear visualmente
- Se recrea el objeto entero en cada render — potencial problema de performance
- Si se necesita reutilizar los estilos de markdown en otro lugar (ej. previsualización), no es posible sin copiar todo

**Refactor sugerido:**
- Extraer los componentes a un objeto constante fuera del componente:

```typescript
const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children, ...props }) => ( <h1 className="text-2xl font-bold text-gray-900" {...props}>{children}</h1> ),
  // ... resto
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
```

---

### CS-03: Long Parameter List — Navbar con exceso de lógica de layout responsivo inline — Severidad: 🟡

**Ubicación:** `src/components/shared/Navbar.tsx:25-146`

**Código:**

```typescript
export function Navbar() {
  const locale = useLocale();
  const { user, isLoading, userName, userEmail, userPicture } = useCurrentUser();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      {/* ... Logo ... */}
      {/* Desktop nav links */}
      <div className="hidden items-center gap-6 md:flex">
        <Link href={`/${locale}/dashboard`}>Dashboard</Link>
        <Link href={`/${locale}/chat`}>Chat</Link>
        <Link href={`/${locale}/knowledge`}>Knowledge</Link>
      </div>
      {/* User section: language, skeleton, sign-in, or full dropdown */}
      {isLoading && <div className="h-10 w-10 animate-pulse ..." />}
      {!isLoading && !user && <Button>Sign In</Button>}
      {!isLoading && user && (
        <>
          <div className="hidden lg:block"><SectorSelector /></div>
          <DropdownMenu>
            {/* ... 40 lines of dropdown content ... */}
            <div className="px-2 py-2 sm:hidden"><LanguageSelector /></div>
            <div className="px-2 py-2 lg:hidden"><SectorSelector /></div>
            {/* ... profile, settings links ... */}
          </DropdownMenu>
        </>
      )}
    </nav>
  );
}
```

**Problema:** El componente `Navbar` maneja **3 estados visuales** (loading, no auth, auth) y **3 breakpoints** (mobile, tablet, desktop) con componentes duplicados para cada breakpoint (`SectorSelector` aparece 2 veces, `LanguageSelector` 2 veces). Esto resulta en un componente de 146 líneas con lógica condicional compleja.

**Impacto:**
- Los componentes `SectorSelector` y `LanguageSelector` se montan duplicados en el DOM (solo ocultos por CSS) — render innecesario
- Difícil de modificar la estructura responsiva sin riesgo de romper otro breakpoint

**Refactor sugerido:**
- Extraer `DesktopNav` y `MobileNav` como sub-componentes
- Usar un único `SectorSelector` y moverlo condicionalmente con un portal o con un solo punto de render

---

### CS-04: Data Clumps — Patrón `/${locale}/auth/signin` repetido en 6+ ubicaciones — Severidad: ⚠️

**Ubicación:** Múltiples archivos

**Código:**

```typescript
// HeroSection.tsx
<Link href={`/${locale}/auth/signin`}>{t('cta.primary')}</Link>
<Link href={`/${locale}/auth/signin`}>{t('cta.secondary')}</Link>

// LandingNavbar.tsx
<Link href={`/${locale}/auth/signin`}>{t('signIn')}</Link>
<Link href={`/${locale}/auth/signin`}>{t('getStarted')}</Link>
// ... y en mobile menu:
<Link href={`/${locale}/auth/signin`}>{t('signIn')}</Link>
<Link href={`/${locale}/auth/signin`}>{t('getStarted')}</Link>

// CtaFooter.tsx
<Link href={`/${locale}/auth/signin`}>{t('button')}</Link>

// AuthErrorPage
<Link href={`/${locale}/auth/signin`}>Try Again</Link>

// Navbar.tsx
<Link href={`/${locale}/auth/signin`}>Sign In</Link>
```

**Problema:** La ruta `/${locale}/auth/signin` se construye manualmente con template literal en **8+ sitios**. Si la ruta cambia (ej. `/auth/login`), hay que actualizar todos.

**Impacto:**
- Baja probabilidad de cambio en rutas auth, pero viola DRY
- Cada instancia repite la interpolación del locale

**Refactor sugerido:**
- Crear un helper de rutas en `lib/routes.ts`:

```typescript
export const routes = {
  signIn: (locale: string) => `/${locale}/auth/signin`,
  dashboard: (locale: string) => `/${locale}/dashboard`,
  chat: (locale: string) => `/${locale}/chat`,
};
```

---

## 🔄 BEHAVIORAL — Code Smells de Comportamiento

### CS-05: Duplicate Code — UUIDs de sectores hardcodeados en 3 archivos diferentes — Severidad: 🔴

**Ubicación:**
- `src/components/chat/ChatContainer.tsx:14`
- `src/constants/suggested-questions.ts:7,15,23`
- `src/components/user/SectorSelector.tsx:25-38`

**Código:**

```typescript
// ChatContainer.tsx
const TEST_SECTOR_ID = '440e8400-e29b-41d4-a716-446655440000';

// suggested-questions.ts
'440e8400-e29b-41d4-a716-446655440000': [ /* HR questions */ ],
'440e8400-e29b-41d4-a716-446655440001': [ /* Engineering questions */ ],
'440e8400-e29b-41d4-a716-446655440002': [ /* Sales questions */ ],

// SectorSelector.tsx
const AVAILABLE_SECTORS = [
  { id: '440e8400-e29b-41d4-a716-446655440000', name: 'Human Resources' },
  { id: '440e8400-e29b-41d4-a716-446655440001', name: 'Engineering' },
  { id: '440e8400-e29b-41d4-a716-446655440002', name: 'Sales' },
];
```

**Problema:** Los **mismos 3 UUIDs** de sectores están dispersos en 3 archivos con diferentes formatos. `ChatContainer` tiene solo el ID de HR hardcodeado como constante de MVP. `suggested-questions.ts` los usa como keys de objeto. `SectorSelector` los tiene como array de objetos con nombre.

**Impacto:**
- Si se agrega un sector nuevo, hay que actualizar **3 archivos**
- Si se corrige un UUID, riesgo de inconsistencia
- El `TEST_SECTOR_ID` en `ChatContainer` ignora completamente el `SectorSelector` — el usuario puede seleccionar "Engineering" pero el chat siempre envía "HR"

**Refactor sugerido:**
- Centralizar en `src/constants/sectors.ts`:

```typescript
export const SECTORS = [
  { id: '440e8400-e29b-41d4-a716-446655440000', name: 'Human Resources' },
  { id: '440e8400-e29b-41d4-a716-446655440001', name: 'Engineering' },
  { id: '440e8400-e29b-41d4-a716-446655440002', name: 'Sales' },
] as const;

export const DEFAULT_SECTOR_ID = SECTORS[0].id;
```

- `ChatContainer` debe usar `currentSectorId` del store, NO `TEST_SECTOR_ID`

---

### CS-06: Duplicate Code — Lógica de `signOut` duplicada en `LogoutButton` y `AppSidebar` — Severidad: 🔴

**Ubicación:**
- `src/components/user/LogoutButton.tsx:39-47`
- `src/components/dashboard/app-sidebar.tsx:51-53`

**Código:**

```typescript
// LogoutButton.tsx — con manejo de estado y error
const handleLogout = async () => {
  try {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: `/${locale}` });
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    setIsLoggingOut(false);
  }
};

// AppSidebar.tsx — sin manejo de error
const handleSignOut = async () => {
  await signOut({ callbackUrl: `/${locale}` });
};
```

**Problema:** Dos implementaciones **diferentes** del mismo flujo de logout. `LogoutButton` tiene manejo de error y estado de loading, con diálogo de confirmación. `AppSidebar` es un fire-and-forget sin protección. Si `signOut` falla en el sidebar, el usuario no recibe feedback.

**Impacto:**
- Comportamiento inconsistente: un componente maneja errores, el otro no
- El sidebar no tiene confirmación antes de cerrar sesión — riesgo de logout accidental
- Si se cambia el callback URL, hay que actualizar 2 sitios

**Refactor sugerido:**
- Reutilizar `LogoutButton` en el sidebar en lugar de duplicar la lógica
- O extraer un hook `useLogout()`:

```typescript
// hooks/useLogout.ts
export function useLogout() {
  const locale = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: `/${locale}` });
    } catch (error) {
      logError(error, { context: 'logout' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
```

---

### CS-07: Duplicate Code — Links de navegación duplicados entre desktop y mobile en `LandingNavbar` — Severidad: 🟡

**Ubicación:** `src/components/landing/LandingNavbar.tsx:30-48` y `73-95`

**Código:**

```typescript
// Desktop nav (line 30-48)
<nav className="hidden items-center gap-8 md:flex">
  <a href="#features" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
    {t('features')}
  </a>
  <a href="#how-it-works" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
    {t('howItWorks')}
  </a>
  <a href="#use-cases" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
    {t('useCases')}
  </a>
</nav>

// ... y mobile (line 73-95)
<nav className="flex flex-col gap-4">
  <a href="#features" className="text-muted-foreground text-sm" onClick={() => setMobileOpen(false)}>
    {t('features')}
  </a>
  <a href="#how-it-works" className="text-muted-foreground text-sm" onClick={() => setMobileOpen(false)}>
    {t('howItWorks')}
  </a>
  <a href="#use-cases" className="text-muted-foreground text-sm" onClick={() => setMobileOpen(false)}>
    {t('useCases')}
  </a>
</nav>
```

**Problema:** Los 3 links de navegación (`features`, `how-it-works`, `use-cases`) están **definidos dos veces** con diferentes clases pero los mismos `href` y textos i18n. Los botones de auth (`signIn`, `getStarted`) también están duplicados entre desktop y mobile.

**Impacto:**
- Si se agrega un link de navegación, hay que añadirlo en 2 lugares
- Si se renombra un anchor (`#features` → `#capabilities`), hay que actualizar 2 bloques

**Refactor sugerido:**
- Extraer los links a un array data-driven:

```typescript
const NAV_LINKS = [
  { href: '#features', labelKey: 'features' },
  { href: '#how-it-works', labelKey: 'howItWorks' },
  { href: '#use-cases', labelKey: 'useCases' },
] as const;

// Desktop
{NAV_LINKS.map(link => (
  <a key={link.href} href={link.href}>{t(link.labelKey)}</a>
))}
```

---

### CS-08: Duplicate Code — Lógica de "get user initials" implementada diferente en 2 componentes — Severidad: 🟡

**Ubicación:**
- `src/components/dashboard/app-sidebar.tsx:55-63`
- `src/components/shared/UserAvatar.tsx:30`

**Código:**

```typescript
// AppSidebar — extrae las 2 primeras iniciales
const getUserInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// UserAvatar — extrae solo la primera letra
const initial = avatarName?.charAt(0).toUpperCase() || 'U';
```

**Problema:** Dos implementaciones **diferentes** del mismo concepto ("iniciales del usuario"). `AppSidebar` genera "GR" para "Gabriela Romero", mientras `UserAvatar` genera solo "G". El fallback es el mismo ('U'), pero el resultado es distinto.

**Impacto:**
- Inconsistencia visual: el sidebar muestra 2 letras, el avatar muestra 1
- Si se cambia la lógica de iniciales, hay que encontrar ambas implementaciones

**Refactor sugerido:**
- Crear una utilidad compartida `getUserInitials(name?: string | null, maxChars = 2): string` en `lib/utils.ts`
- Usar en ambos componentes

---

### CS-09: Duplicate Code — Blob Base64 `PLACEHOLDER_BLUR` duplicado entre `image-config.ts` y `OptimizedImage.tsx` — Severidad: 🟡

**Ubicación:**
- `src/lib/utils/image-config.ts:40-41`
- `src/components/ui/OptimizedImage.tsx:72-74`

**Código:**

```typescript
// image-config.ts — exportada como constante
export const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI...';

// OptimizedImage.tsx — hardcodeada inline
blurDataURL={
  priority
    ? undefined
    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCI...'
}
```

**Problema:** El mismo string Base64 de ~130 caracteres está definido en `image-config.ts` como `PLACEHOLDER_BLUR` pero `OptimizedImage.tsx` lo duplica inline en vez de importar la constante.

**Impacto:**
- Si se cambia el placeholder (ej. un color diferente), hay que actualizar 2 sitios
- La constante `PLACEHOLDER_BLUR` existe específicamente para esto pero no se usa

**Refactor sugerido:**
- En `OptimizedImage.tsx`, importar y usar `PLACEHOLDER_BLUR`:

```typescript
import { PLACEHOLDER_BLUR } from '@/lib/utils/image-config';
// ...
blurDataURL={priority ? undefined : PLACEHOLDER_BLUR}
```

---

### CS-10: Dead Code — `auth0.config.ts` exporta configuración que nunca se importa — Severidad: ⚠️

**Ubicación:** `src/lib/auth0.config.ts` (13 líneas)

**Código:**

```typescript
export const auth0Config = {
  secret: process.env.AUTH0_SECRET!,
  baseURL: process.env.AUTH0_BASE_URL!,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL!,
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  audience: process.env.AUTH0_AUDIENCE,
  scope: 'openid profile email',
};
```

**Problema:** Este archivo exporta `auth0Config` pero **ningún archivo de producción lo importa**. La configuración real de Auth0 está en `src/auth.ts` usando NextAuth v5 con `Auth0Provider`. Este es un vestigio de una configuración anterior (Auth0 SDK directo).

**Impacto:**
- Confunde al lector: ¿cuál es la configuración correcta?
- Las variables `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL` pueden no estar configuradas en el entorno actual
- Los non-null assertions (`!`) ocultan errores si las variables no existen

**Refactor sugerido:**
- Verificar que no hay imports en tests → eliminar el archivo
- Si se necesita como backup/referencia, mover a un comentario en `auth.ts`

---

## 🎯 OBJECT-ORIENTED / React — Code Smells de Patrones React

### CS-11: Feature Envy — `ChatContainer` construye objetos `MessageDto` manualmente — Severidad: 🟡

**Ubicación:** `src/components/chat/ChatContainer.tsx:45-82`

**Código:**

```typescript
// Construye userMessage manualmente
const userMessage = {
  id: `temp-user-${Date.now()}`,
  conversationId: conversationId || 'new',
  role: MessageRole.USER,
  content: messageContent,
  createdAt: new Date().toISOString(),
};
addMessage(userMessage);

// ... después de la respuesta API ...

// Construye assistantMessage manualmente
const assistantMessage = {
  id: `assistant-${Date.now()}`,
  conversationId: response.conversationId,
  role: MessageRole.ASSISTANT,
  content: response.response,
  createdAt:
    typeof response.timestamp === 'string'
      ? response.timestamp
      : new Date(response.timestamp).toISOString(),
  sourcesUsed: response.sources,
};
addMessage(assistantMessage);
```

**Problema:** El componente `ChatContainer` tiene **conocimiento íntimo** de la estructura de `MessageDto` y construye objetos manualmente en dos puntos diferentes. Los IDs usan `Date.now()` (no garantiza unicidad). La conversión de `timestamp` es ad-hoc. Además, `ChatContainer` usa `TEST_SECTOR_ID` hardcodeado en lugar del `currentSectorId` del store.

**Impacto:**
- Si `MessageDto` cambia, hay que actualizar el componente
- `Date.now()` como generador de IDs puede causar colisiones si se envían 2 mensajes en el mismo milisegundo
- El timestamp handling repite lógica que debería estar en una utilidad

**Refactor sugerido:**
- Crear factory functions en `types/message.types.ts`:

```typescript
export function createUserMessage(content: string, conversationId: string): MessageDto {
  return {
    id: `user-${crypto.randomUUID()}`,
    conversationId,
    role: MessageRole.USER,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function createAssistantMessage(response: ChatResponseDto): MessageDto { ... }
```

- Usar `currentSectorId` del store en vez de `TEST_SECTOR_ID`

---

### CS-12: Feature Envy — `SourceCard` hace type assertions de metadata repetidamente — Severidad: 🟡

**Ubicación:** `src/components/chat/SourceCard.tsx:25-27`

**Código:**

```typescript
const documentTitle = (source.metadata?.title as string | undefined) || `Document ${index + 1}`;
const page = source.metadata?.page as number | undefined;
const sourceUrl = source.metadata?.url as string | undefined;
```

**Problema:** El componente `SourceCard` hace **3 type assertions** (`as string`, `as number`, `as string`) para extraer campos de `metadata: Record<string, unknown>`. Esto es conocimiento profundo sobre la estructura interna de metadata que el componente no debería tener.

**Impacto:**
- Si los nombres de keys cambian en el backend, se rompe silenciosamente (retorna `undefined`)
- Las type assertions eliminan la seguridad de TypeScript
- Patrón repetible si se agregan más campos de metadata

**Refactor sugerido:**
- Tipar la metadata con una interfaz:

```typescript
interface SourceMetadata {
  title?: string;
  page?: number;
  url?: string;
  [key: string]: unknown;
}

// O crear un helper
function extractSourceMeta(metadata?: Record<string, unknown>) {
  return {
    title: typeof metadata?.title === 'string' ? metadata.title : undefined,
    page: typeof metadata?.page === 'number' ? metadata.page : undefined,
    url: typeof metadata?.url === 'string' ? metadata.url : undefined,
  };
}
```

---

### CS-13: Middle Man — `useCurrentUser` hook retorna `error: null` siempre hardcodeado — Severidad: ⚠️

**Ubicación:** `src/hooks/useCurrentUser.ts:20`

**Código:**

```typescript
export function useCurrentUser() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const currentSectorId = useCurrentSectorId();
  const sectors = useSectors();

  return {
    user,
    isLoading: status === 'loading',
    error: null,  // <-- siempre null
    isAuthenticated: status === 'authenticated',
    currentSectorId,
    sectors,
    userName: user?.name || 'Guest',
    userEmail: user?.email || '',
    userPicture: user?.image || '',
  };
}
```

**Problema:** El campo `error` siempre retorna `null`. Ningún consumidor lo chequea para mostrar errores. Es un **Temporary Field** que existe en la interfaz pero nunca tiene valor.

**Impacto:**
- Los consumidores (ej. `Navbar`) desestructuran `error` sin que tenga utilidad
- Sugiere que debería haber error handling que no se implementó

**Refactor sugerido:**
- Eliminar `error` del return si no se usa
- O implementar error handling real (ej. capturar errores de `useSession()`)

---

### CS-14: Inappropriate Intimacy — `AppSidebar` usa `as any` para acceder a roles de sesión — Severidad: ⚠️

**Ubicación:** `src/components/dashboard/app-sidebar.tsx:69-76`

**Código:**

```typescript
const getUserRole = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = (session as any)?.user?.roles;
  if (roles && Array.isArray(roles) && roles.length > 0) {
    return roles[0];
  }
  return 'user';
};
```

**Problema:** El componente usa `as any` para acceder a `session.user.roles` que **no existe en el tipo de sesión de NextAuth**. Esto rompe la cadena de tipos y requiere un `eslint-disable`. Indica que el tipo de sesión de NextAuth no fue extendido correctamente.

**Impacto:**
- Cero type safety — si `roles` se mueve o renombra, no hay error de compilación
- El `eslint-disable` es un smell secundario

**Refactor sugerido:**
- Extender el tipo de sesión en `types/next-auth.d.ts`:

```typescript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles?: string[];
      // ... otros campos
    } & DefaultSession['user'];
  }
}
```

- O mover los roles al JWT callback y exponerlos en la sesión tipada

---

## 💾 DATA — Code Smells de Datos

### CS-15: Primitive Obsession — Sector IDs como strings UUID sin validación ni tipo dedicado — Severidad: 🔴

**Ubicación:** Todo el proyecto (`ChatContainer`, `SectorSelector`, `suggested-questions`, stores, hooks)

**Código:**

```typescript
// ChatContainer.tsx — string literal
const TEST_SECTOR_ID = '440e8400-e29b-41d4-a716-446655440000';

// user.store.tsx — primitive string state
currentSectorId: string | null;

// ChatQueryDto — primitive string
interface ChatQueryDto {
  userId: string;     // <-- es un UUID
  sectorId: string;   // <-- es un UUID
  query: string;
}

// suggested-questions.ts — UUIDs como keys de objeto
Record<string, string[]>
```

**Problema:** Los sector IDs y user IDs son **strings primitivos** sin ningún branded type o validación. El `ChatContainer` usa un UUID hardcodeado `TEST_SECTOR_ID` que **ignora la selección del usuario** en `SectorSelector`. El `ChatQueryDto` acepta cualquier string como `sectorId`.

**Impacto:**
- El bug más grave: el chat **siempre envía el sector HR** sin importar lo que el usuario seleccione — la funcionalidad de `SectorSelector` es cosmética
- Ninguna validación previene enviar un string vacío o malformado como sector ID
- Fácil pasar un userId donde va sectorId (ambos son `string`)

**Refactor sugerido:**
- Paso inmediato: Usar `currentSectorId` del store en `ChatContainer` en vez de `TEST_SECTOR_ID`
- Crear branded types:

```typescript
type SectorId = string & { readonly __brand: 'SectorId' };
type UserId = string & { readonly __brand: 'UserId' };
```

---

### CS-16: Magic Numbers — Timeouts, tamaños y límites como literales numéricos — Severidad: 🟡

**Ubicación:** Múltiples archivos

**Código:**

```typescript
// client.ts — timeouts
const API_CONFIG = {
  timeout: 30000,  // 30 seconds — Magic Number
};
async function getAccessToken(timeout = 5000, signal?: AbortSignal) // 5 seconds — Magic Number

// MessageInput.tsx
const MAX_MESSAGE_LENGTH = 2000;  // ✅ Bien nombrada, pero...
const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.8;  // 0.8 — ¿por qué 80%?

// MessageList.tsx
<div className="flex max-w-[75%] flex-col ..." />  // 75% — Magic Number en CSS

// SourceList.tsx
<SourceList sources={message.sourcesUsed} maxSources={5} />  // 5 — por defecto

// TypingIndicator.tsx
style={{ animationDelay: '0ms' }}
style={{ animationDelay: '150ms' }}  // Magic numbers inline
style={{ animationDelay: '300ms' }}  // Magic numbers inline
```

**Problema:** `30000` y `5000` son timeouts que parecen arbitrarios. El `0.8` (80%) es un umbral sin nombre. Los `animationDelay` podrían ser constantes. El `max-w-[75%]` es un valor mágico de CSS.

**Impacto:**
- Para ajustar timeouts, hay que buscar en el código fuente
- El umbral de `0.8` no es autodocumentado — ¿por qué 80% y no 90%?

**Refactor sugerido:**
- En `client.ts`:

```typescript
const API_TIMEOUT_MS = 30_000;
const TOKEN_TIMEOUT_MS = 5_000;
```

- En `MessageInput.tsx`:

```typescript
const NEAR_LIMIT_THRESHOLD = 0.8;
const isNearLimit = charCount > MAX_MESSAGE_LENGTH * NEAR_LIMIT_THRESHOLD;
```

---

### CS-17: Magic Numbers / Data Class — Dashboard stats hardcodeados con datos ficticios — Severidad: 🟡

**Ubicación:** `src/app/[locale]/(protected)/dashboard/page.tsx:24-49`

**Código:**

```typescript
// Mock stats for MVP - will be replaced with real API calls
const stats = [
  { title: t('stats.queries.title'), value: '1,247', change: t('stats.queries.change'), icon: MessageSquare },
  { title: t('stats.documents.title'), value: '156', change: t('stats.documents.change'), icon: FileText },
  { title: t('stats.users.title'), value: '24', change: t('stats.users.change'), icon: Users },
  { title: t('stats.accuracy.title'), value: '92%', change: t('stats.accuracy.change'), icon: TrendingUp },
];
```

**Problema:** Los valores `'1,247'`, `'156'`, `'24'`, `'92%'` son **datos ficticios hardcodeados** directamente en la page. Aunque hay un comentario "Mock stats for MVP", estos valores se muestran al usuario como si fueran reales.

**Impacto:**
- El usuario ve datos falsos sin indicación de que son mockups
- Los strings `'1,247'` no son numéricos — no se pueden comparar ni formatear

**Refactor sugerido:**
- Mover a una constante en `constants/mock-data.ts` para que sea obvio que es mock
- Agregar indicador visual "(mock)" o badge "coming soon" sobre los valores
- Cuando se conecte a API real, solo se elimina el import del mock

---

### CS-18: Temporary Field / Unused Feature — `sentimentScore` en `MessageDto` nunca se usa — Severidad: ⚠️

**Ubicación:** `src/types/message.types.ts:32`

**Código:**

```typescript
export interface MessageDto {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sourcesUsed?: SourceFragment[];
  sentimentScore?: number;  // <-- nunca usado
  metadata?: Record<string, unknown>;  // <-- nunca leído en componentes
  createdAt: string;
}
```

**Problema:** Los campos `sentimentScore` y `metadata` en `MessageDto` **nunca se leen** en ningún componente ni hook del frontend. Son campos que existen en la interface pero no tienen consumidores.

**Impacto:**
- Agregan ruido al tipo sin valor
- Cada vez que se crea un `MessageDto` manualmente (en `ChatContainer`), estos campos opcionales confunden

**Refactor sugerido:**
- Si se implementarán en el futuro: documentar con `/** @planned Phase X */`
- Si no: eliminar del tipo (YAGNI)

---

## 📊 Resumen de Refactorizaciones por Prioridad

### Prioridad 🔴 ALTA (impacto directo en funcionalidad y mantenibilidad)

| # | Smell | Archivo | Esfuerzo |
|---|-------|---------|----------|
| CS-01 | Long Method: JWT callback 66 líneas | `auth.ts` | 2h |
| CS-05 | UUIDs de sectores duplicados en 3 archivos | `ChatContainer`, `SectorSelector`, `suggested-questions` | 1h |
| CS-06 | Lógica de signOut duplicada | `LogoutButton.tsx`, `app-sidebar.tsx` | 30min |
| CS-15 | **BUG**: `TEST_SECTOR_ID` ignora selección del usuario | `ChatContainer.tsx` | 30min |

### Prioridad 🟡 MEDIA (mejorar en próximos sprints)

| # | Smell | Archivo | Esfuerzo |
|---|-------|---------|----------|
| CS-02 | 18 componentes inline en MarkdownRenderer | `MarkdownRenderer.tsx` | 1h |
| CS-03 | Navbar con componentes duplicados por breakpoint | `Navbar.tsx` | 1.5h |
| CS-07 | Nav links duplicados desktop/mobile | `LandingNavbar.tsx` | 30min |
| CS-08 | `getUserInitials()` duplicada con lógica diferente | `app-sidebar.tsx`, `UserAvatar.tsx` | 30min |
| CS-09 | `PLACEHOLDER_BLUR` duplicada en image config y component | `image-config.ts`, `OptimizedImage.tsx` | 15min |
| CS-11 | ChatContainer construye MessageDto manualmente | `ChatContainer.tsx` | 1h |
| CS-12 | SourceCard hace type assertions de metadata | `SourceCard.tsx` | 30min |
| CS-16 | Magic Numbers (timeouts, thresholds) | `client.ts`, `MessageInput.tsx` | 30min |
| CS-17 | Dashboard stats con datos ficticios hardcodeados | `dashboard/page.tsx` | 30min |

### Prioridad ⚠️ BAJA (nice-to-have)

| # | Smell | Archivo | Esfuerzo |
|---|-------|---------|----------|
| CS-04 | Ruta `/auth/signin` repetida 8+ veces | múltiples | 30min |
| CS-10 | `auth0.config.ts` es dead code | `lib/auth0.config.ts` | 15min |
| CS-13 | `error: null` hardcodeado en `useCurrentUser` | `hooks/useCurrentUser.ts` | 15min |
| CS-14 | `as any` para roles de sesión en sidebar | `app-sidebar.tsx` | 30min |
| CS-18 | `sentimentScore` nunca usado en `MessageDto` | `types/message.types.ts` | 15min |

---

## 🚨 Bug Identificado Durante el Análisis

> **CS-15 / CS-05 — Sector ID Hardcodeado Ignora Selección del Usuario**
>
> El `ChatContainer` usa `TEST_SECTOR_ID` (línea 14) que siempre envía el sector **"Human Resources"** al backend, independientemente de lo que el usuario haya seleccionado en `SectorSelector`. Esto anula la funcionalidad del selector de sectores.
>
> **Fix inmediato:** Reemplazar `TEST_SECTOR_ID` con `currentSectorId` del store del usuario:
> ```typescript
> const currentSectorId = useCurrentSectorId();
> // En handleSendMessage:
> sectorId: currentSectorId || DEFAULT_SECTOR_ID,
> ```

---

## 🎯 Observaciones Positivas

El análisis también identificó buenas prácticas que merece la pena mantener:

1. **Composición de componentes**: Los componentes son pequeños y enfocados (<200 líneas cada uno, excepto `MarkdownRenderer` y `Navbar`)
2. **Zustand con Context pattern**: Los stores usan `createContext` + `useStore` con selectores granulares para evitar re-renders innecesarios
3. **Hooks granulares en stores**: `useIsLoading()`, `useMessages()`, `useCurrentSectorId()` — excelente para minimizar re-renders
4. **Error boundary**: Implementado correctamente con recovery y detalles en dev mode
5. **API client centralizado**: `fetchWithInterceptors()` maneja auth, timeout, y errors en un solo lugar
6. **Tipos compartidos**: `MessageDto`, `ChatResponseDto`, `SourceFragment` están bien definidos y centralizados
7. **Validación de env vars**: `validateEnvironment()` con reglas tipadas es robusta
8. **Accesibilidad**: `aria-label`, `aria-expanded`, `role="status"`, `data-testid` presentes en la mayoría de componentes
9. **i18n completo**: Landing page totalmente internacionalizada con `next-intl`
10. **Constantes nombradas**: `MAX_MESSAGE_LENGTH`, `MIN_MESSAGE_LENGTH`, `ERROR_ICONS`, `ERROR_TITLES` — bien nombradas

---

## 📋 Conclusión

El frontend de Context.AI muestra una arquitectura sólida con componentes pequeños, separación de concerns clara, y buenas prácticas de React moderno. Los code smells identificados son mayormente resultado del desarrollo incremental de MVP:

- Los **smells más graves** están en la capa de datos (sector ID hardcodeado que anula funcionalidad) y en la capa de autenticación (JWT callback monolítico)
- Los **smells moderados** son duplicaciones que surgieron naturalmente al agregar features en paralelo (logout, iniciales, nav links)
- Los **smells menores** son campos no usados y archivos legacy que pueden limpiarse en un sprint de tech debt

**Deuda técnica total estimada:** ~16-22 horas de trabajo  
**Quick wins (< 2 horas):** CS-15, CS-05, CS-06, CS-09, CS-10 — eliminan el bug del sector y la duplicación más obvia  
**ROI esperado:** Reducción del ~35% en tiempo de mantenimiento y eliminación de un bug funcional crítico

