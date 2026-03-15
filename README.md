# Context.ai Frontend

[![CI](https://github.com/context-ai-project/context-ai-front/actions/workflows/ci.yml/badge.svg)](https://github.com/context-ai-project/context-ai-front/actions/workflows/ci.yml)
[![CodeQL](https://github.com/context-ai-project/context-ai-front/actions/workflows/codeql.yml/badge.svg)](https://github.com/context-ai-project/context-ai-front/actions/workflows/codeql.yml)
[![Snyk Security](https://github.com/context-ai-project/context-ai-front/actions/workflows/snyk.yml/badge.svg)](https://github.com/context-ai-project/context-ai-front/actions/workflows/snyk.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Descripción General

Context.ai es una plataforma de gestión de conocimiento empresarial potenciada por Inteligencia Artificial. Utiliza un sistema RAG (Retrieval-Augmented Generation) que permite a las organizaciones centralizar su documentación interna y consultarla mediante un asistente de chat inteligente.

Este repositorio contiene el **frontend** de la aplicación, desarrollado como Trabajo Final de Máster (TFM) del programa de Maestría en Inteligencia Artificial. La interfaz permite a los usuarios:

- Conversar con un asistente IA que responde en base a la documentación de la empresa.
- Subir y gestionar fuentes de conocimiento (PDF, Markdown).
- Visualizar métricas de uso en un dashboard.
- Acceder a la plataforma de forma segura con autenticación OAuth2.

El frontend se comunica con el backend (`context-ai-api`) mediante API REST, utilizando tokens JWT de Auth0 para autenticación y autorización.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Configuración](#-configuración)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Integración con Backend](#-integración-con-backend)

## ✨ Funcionalidades Principales

| Funcionalidad | Descripción |
|---|---|
| **Chat IA con RAG** | Interfaz conversacional que consulta documentación interna mediante Retrieval-Augmented Generation. Muestra respuestas con citas a las fuentes originales. |
| **Gestión de Conocimiento** | Carga de documentos (PDF, Markdown) que se procesan, fragmentan y almacenan como vectores para búsqueda semántica. |
| **Dashboard de Métricas** | Panel con estadísticas de uso: consultas realizadas, documentos indexados, usuarios activos y precisión del sistema. |
| **Autenticación OAuth2** | Login seguro mediante Auth0 con NextAuth.js v5. Soporte para JWT, sincronización de usuarios con el backend y control de sesiones. |
| **Internacionalización (i18n)** | Soporte multiidioma (español e inglés) mediante next-intl con rutas localizadas (`/es/chat`, `/en/chat`). |
| **Landing Page** | Página de presentación del producto con secciones de características, funcionamiento, casos de uso y llamadas a la acción. |
| **Renderizado Markdown** | Las respuestas del asistente se renderizan con formato Markdown completo (tablas, código, listas) mediante react-markdown. |
| **Diseño Responsive** | Interfaz adaptativa para escritorio y móvil con sidebar colapsable y navegación responsive. |
| **Accesibilidad (a11y)** | Cumplimiento de estándares WCAG con validación mediante eslint-plugin-jsx-a11y y tests con vitest-axe. |
| **Monitoreo de Errores** | Integración con Sentry para captura y seguimiento de errores en producción. |

## 🚀 Stack Tecnológico

### Framework y Lenguaje

- **Next.js 16** — React framework con App Router y Server Components
- **TypeScript 5** — Tipado estático
- **React 19** — Biblioteca UI

### Estilos y UI

- **Tailwind CSS 4** — Framework de utilidades CSS (configuración vía PostCSS)
- **shadcn/ui** — Componentes UI basados en Radix UI
- **Lucide React** — Sistema de iconos

### Estado y Data Fetching

- **Zustand** — State management ligero
- **TanStack Query (React Query)** — Data fetching, caching y sincronización
- **Fetch API** — Cliente HTTP nativo

### Autenticación

- **NextAuth.js v5** (Auth.js) — Autenticación con proveedor Auth0 (OAuth2/OIDC)

### Internacionalización

- **next-intl** — Routing localizado y traducciones (ES/EN)

### Contenido

- **react-markdown** + **remark-gfm** — Renderizado de Markdown con GitHub Flavored Markdown
- **react-syntax-highlighter** — Resaltado de sintaxis en bloques de código

### Testing

- **Vitest** — Tests unitarios y de componentes (jsdom)
- **Testing Library** (React) — Testing de componentes orientado al usuario
- **vitest-axe** — Tests de accesibilidad automatizados
- **Playwright** — Tests end-to-end y regresión visual

### Calidad de Código

- **ESLint** — Linter con configuración estricta
- **Prettier** — Formateador de código
- **eslint-plugin-sonarjs** — Análisis de calidad
- **eslint-plugin-jsx-a11y** — Reglas de accesibilidad
- **Husky** + **lint-staged** — Git hooks automatizados

### Observabilidad

- **Sentry** (`@sentry/nextjs`) — Monitoreo de errores en producción

### Utilidades

- **Zod** — Validación de datos y schemas
- **date-fns** — Manipulación de fechas

## 📦 Requisitos Previos

- **Node.js** >= 22.x
- **pnpm** >= 10.x (recomendado)
- **Git**

## 🛠️ Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/context-ai-project/context-ai-front.git
cd context-ai-front
```

### 2. Configurar acceso a GitHub Packages

Este proyecto puede usar el paquete `@context-ai-project/shared` publicado en [GitHub Packages](https://github.com/orgs/context-ai-project/packages). GitHub Packages requiere autenticación incluso para paquetes públicos.

1. Crea un **Personal Access Token (Classic)** en GitHub con el scope `read:packages`:
   - Ve a https://github.com/settings/tokens/new
   - Marca ✅ `read:packages`
   - Genera y copia el token

2. Añade la configuración a tu `~/.npmrc` global:

```bash
echo "//npm.pkg.github.com/:_authToken=ghp_TU_TOKEN_AQUI" >> ~/.npmrc
echo "@context-ai-project:registry=https://npm.pkg.github.com/" >> ~/.npmrc
```

> **Nota**: Esto se configura una sola vez por máquina. Si ya lo hiciste para `context-ai-api`, no necesitas repetirlo.

### 3. Instalar dependencias

```bash
pnpm install
```

### 4. Copiar variables de entorno

```bash
cp env.local.example .env.local
# Si solo existe .env.example en tu rama: cp .env.example .env.local
# Editar .env.local con tus credenciales (ver sección Configuración)
```

### 5. Modo desarrollo

```bash
pnpm dev
# Disponible en http://localhost:3000
```

### 6. Build y servidor de producción

```bash
pnpm build
pnpm start
```

### Comandos de calidad de código

```bash
# Lint
pnpm lint
pnpm lint:fix

# Formato
pnpm format
pnpm format:check

# Type checking
pnpm type-check
```

## ⚙️ Configuración

### 1. Variables de Entorno

Edita `.env.local` con tus credenciales:

```env
# Auth0 Configuration
AUTH_SECRET='generate-with-openssl-rand-hex-32'    # Secreto para NextAuth.js v5 (session encryption)
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'
AUTH0_AUDIENCE='https://api.contextai.com'          # Debe coincidir con el identifier de tu API en Auth0

# API Configuration — IMPORTANTE: incluir el prefijo /api/v1
NEXT_PUBLIC_API_URL='http://localhost:3001/api/v1'

# Internal key — debe ser EXACTAMENTE la misma que INTERNAL_API_KEY en context-ai-api/.env
INTERNAL_API_KEY='el-mismo-valor-generado-con-openssl'

# Sentry (Opcional)
NEXT_PUBLIC_SENTRY_DSN=''
SENTRY_AUTH_TOKEN=''
```

### 2. Auth0 Setup

El frontend necesita una aplicación **Regular Web Application** en Auth0, distinta a la M2M del backend.

> Para la guía completa de Auth0 (tenant, API, aplicación frontend), consulta [`context-ai-api/docs/AUTH0_SETUP.md`](../context-ai-api/docs/AUTH0_SETUP.md).

Pasos resumidos:
1. En [Auth0 Dashboard](https://manage.auth0.com/) → **Applications** → **Create Application**
2. Tipo: **Regular Web Application**
3. Configurar en la pestaña **Settings**:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback/auth0`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`
4. Copiar **Client ID** y **Client Secret** al `.env`

## 🧪 Testing

El proyecto utiliza dos frameworks de testing complementarios:

### Tests Unitarios y de Componentes (Vitest)

```bash
# Ejecutar tests unitarios
pnpm test

# Modo watch (re-ejecuta al guardar)
pnpm test:watch

# Con cobertura de código
pnpm test:coverage

# UI interactiva de Vitest
pnpm test:ui
```

### Tests End-to-End (Playwright)

```bash
# Ejecutar tests E2E
pnpm test:e2e

# UI Mode (recomendado para desarrollo)
pnpm test:e2e:ui

# Debug mode
pnpm test:e2e:debug

# Tests de regresión visual
pnpm test:e2e:visual
```

### Ejecutar todos los tests

```bash
pnpm test:all
```

## 📁 Estructura del Proyecto

```
context-ai-front/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Rutas internacionalizadas (es/en)
│   │   │   ├── (auth)/              # Route group: Autenticación
│   │   │   │   ├── callback/
│   │   │   │   └── login/
│   │   │   ├── (protected)/         # Route group: Rutas protegidas
│   │   │   │   ├── chat/            # Chat IA con RAG
│   │   │   │   ├── dashboard/       # Dashboard de métricas
│   │   │   │   ├── knowledge/       # Gestión de conocimiento
│   │   │   │   └── layout.tsx       # Layout con sidebar
│   │   │   ├── auth/                # Páginas NextAuth (signin, error)
│   │   │   ├── layout.tsx           # Layout con providers i18n
│   │   │   └── page.tsx             # Landing page
│   │   ├── api/                     # API Routes
│   │   │   └── auth/                # NextAuth endpoints
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Estilos globales (Tailwind)
│   ├── components/
│   │   ├── chat/                    # Chat: mensajes, input, fuentes, markdown
│   │   ├── dashboard/               # Sidebar y navegación
│   │   ├── knowledge/               # Gestión de documentos
│   │   ├── landing/                 # Landing: hero, features, CTA
│   │   ├── shared/                  # Navbar, ErrorBoundary, LanguageSelector
│   │   ├── user/                    # UserProfile, SectorSelector, Logout
│   │   ├── providers/               # React context providers
│   │   └── ui/                      # shadcn/ui components (Radix-based)
│   ├── hooks/                       # Custom hooks
│   │   ├── use-mobile.ts            # Detección responsive
│   │   ├── use-toast.ts             # Sistema de notificaciones
│   │   └── useCurrentUser.ts        # Hook de usuario autenticado
│   ├── lib/
│   │   ├── api/                     # API clients (chat, user, error handler)
│   │   ├── providers/               # TanStack Query provider
│   │   ├── utils/                   # Utilidades (image config, cn)
│   │   ├── auth0.config.ts          # Configuración Auth0
│   │   └── env-config.ts            # Validación de variables de entorno
│   ├── stores/                      # Zustand stores
│   │   ├── chat.store.tsx           # Estado del chat
│   │   └── user.store.tsx           # Estado del usuario
│   ├── constants/                   # Constantes de la aplicación
│   ├── types/                       # Tipos TypeScript compartidos
│   ├── test/                        # Setup y utilidades de testing
│   ├── auth.ts                      # Configuración NextAuth.js v5
│   ├── i18n.ts                      # Configuración next-intl
│   └── instrumentation.ts           # Sentry instrumentation
├── e2e/                             # Tests Playwright E2E
│   ├── auth/                        # Tests de autenticación
│   ├── chat/                        # Tests de flujo de chat
│   ├── dashboard/                   # Tests de dashboard
│   ├── landing/                     # Tests de landing page
│   ├── navigation/                  # Tests de navegación responsive
│   └── visual-regression/           # Tests de regresión visual
├── messages/                        # Traducciones i18n
│   ├── en.json                      # Inglés
│   └── es.json                      # Español
├── public/                          # Archivos estáticos
├── middleware.ts                     # Middleware i18n + headers
├── playwright.config.ts             # Configuración Playwright
├── vitest.config.ts                 # Configuración Vitest
├── eslint.config.mjs                # Configuración ESLint
├── postcss.config.mjs               # PostCSS (Tailwind v4)
├── .prettierrc                      # Configuración Prettier
├── Dockerfile                       # Imagen Docker multi-stage
└── tsconfig.json                    # Configuración TypeScript
```

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo en `http://localhost:3000` |
| `pnpm build` | Build de producción optimizado |
| `pnpm start` | Inicia servidor de producción |
| `pnpm lint` | Ejecuta ESLint sobre `src/` |
| `pnpm lint:fix` | Ejecuta ESLint y corrige errores automáticamente |
| `pnpm format` | Formatea código con Prettier |
| `pnpm format:check` | Verifica formato sin modificar |
| `pnpm type-check` | Verifica tipos TypeScript (`tsc --noEmit`) |
| `pnpm test` | Ejecuta tests unitarios con Vitest |
| `pnpm test:watch` | Vitest en modo watch |
| `pnpm test:coverage` | Tests unitarios con cobertura de código |
| `pnpm test:ui` | Vitest UI interactiva |
| `pnpm test:e2e` | Ejecuta tests E2E con Playwright |
| `pnpm test:e2e:ui` | Playwright UI mode |
| `pnpm test:e2e:debug` | Playwright debug mode |
| `pnpm test:e2e:visual` | Tests de regresión visual |
| `pnpm test:all` | Ejecuta Vitest + Playwright |

## 🔄 Integración con Backend

El frontend se comunica con el backend (`context-ai-api`) a través de:

1. **API REST** — Endpoints HTTP en `http://localhost:3001/api/v1`
2. **Auth0 JWT** — Tokens de autenticación gestionados por NextAuth.js
3. **Sincronización de usuarios** — Al hacer login, se sincroniza el usuario de Auth0 con la base de datos interna del backend

### Flujo de autenticación

```
Usuario → Auth0 Login → NextAuth.js → JWT Token
                                      ↓
                              POST /users/sync (backend)
                                      ↓
                              userId interno ← respuesta
                                      ↓
                              API calls con Bearer token
```

### Ejemplo de uso

```typescript
import { apiClient } from '@/lib/api/client';

// El token se obtiene automáticamente de la sesión NextAuth
const response = await apiClient.post('/interaction/query', {
  sectorId: 'sector-uuid',
  query: '¿Cómo solicito vacaciones?',
});
```

## 🔒 Seguridad

- ✅ Autenticación OAuth2 vía Auth0 + NextAuth.js v5
- ✅ Tokens JWT gestionados en sesión del servidor
- ✅ Input validation con Zod
- ✅ Headers de cache-control en middleware
- ✅ Rate limiting (API backend)
- ✅ Sanitización de inputs

## 🐛 Git Hooks

### Pre-commit (automático)

- Ejecuta `lint-staged` sobre archivos modificados
- Formatea código con Prettier
- Corrige errores de ESLint

### Pre-push (automático)

- Verifica tipos TypeScript (`tsc --noEmit`)
- Ejecuta linter completo
- Auditoría de seguridad de dependencias

---

## 🤝 Contribución

Este proyecto es parte del TFM de la Maestría en IA.

Para más información, consulta la documentación en `/Context.ai/documentation/`.
