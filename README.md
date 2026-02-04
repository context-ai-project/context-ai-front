# Context.ai Frontend

[![CI](https://github.com/gromeroalfonso/context-ai-front/actions/workflows/ci.yml/badge.svg)](https://github.com/gromeroalfonso/context-ai-front/actions/workflows/ci.yml)
[![CodeQL](https://github.com/gromeroalfonso/context-ai-front/actions/workflows/codeql.yml/badge.svg)](https://github.com/gromeroalfonso/context-ai-front/actions/workflows/codeql.yml)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Frontend de la aplicación Context.ai - Sistema RAG (Retrieval Augmented Generation) con gestión de conocimiento y chat inteligente.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Integración con Backend](#-integración-con-backend)

## 🚀 Stack Tecnológico

### Framework y Lenguaje
- **Next.js 16** - React framework con App Router
- **TypeScript 5** - Tipado estático
- **React 19** - Biblioteca UI

### Estilos y UI
- **Tailwind CSS 4** - Framework de utilidades CSS
- **shadcn/ui** - Componentes UI copiables
- **Lucide React** - Iconos

### Estado y Data Fetching
- **Zustand** - State management ligero
- **TanStack Query (React Query)** - Data fetching y caching
- **Fetch API** - Cliente HTTP nativo

### Autenticación
- **Auth0 Next.js SDK** - Autenticación OAuth2/OIDC

### Calidad de Código
- **ESLint** - Linter con configuración estricta
- **Prettier** - Formateador de código
- **SonarJS** - Análisis de calidad
- **jsx-a11y** - Reglas de accesibilidad
- **Husky** - Git hooks

### Testing
- **Playwright** - Testing E2E

### Observabilidad
- **Sentry** - Monitoreo de errores

## 📦 Requisitos Previos

- **Node.js** >= 22.x
- **pnpm** >= 10.x (recomendado)
- **Git**

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/gromeroalfonso/context-ai-front.git
cd context-ai-front

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp env.local.example .env.local
```

## ⚙️ Configuración

### 1. Variables de Entorno

Edita `.env.local` con tus credenciales:

```env
# Auth0 Configuration
AUTH0_SECRET='generate-with-openssl-rand-hex-32'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'
AUTH0_AUDIENCE='YOUR_API_IDENTIFIER'

# API Configuration
NEXT_PUBLIC_API_URL='http://localhost:3001'

# Sentry (Opcional)
NEXT_PUBLIC_SENTRY_DSN=''
SENTRY_AUTH_TOKEN=''
```

### 2. Auth0 Setup

1. Crear aplicación en [Auth0 Dashboard](https://manage.auth0.com/)
2. Configurar Allowed Callback URLs:
   - `http://localhost:3000/api/auth/callback`
3. Configurar Allowed Logout URLs:
   - `http://localhost:3000`
4. Copiar credenciales a `.env.local`

### 3. Integración con Paquete Compartido

Durante el desarrollo del MVP, usaremos `pnpm link`:

```bash
# En el directorio context-ai-shared
cd ../context-ai-shared
pnpm link --global

# En el directorio context-ai-front
cd ../context-ai-front
pnpm link --global @context-ai/shared
```

Post-MVP, se publicará en GitHub Packages.

## 🏗️ Desarrollo

```bash
# Modo desarrollo (http://localhost:3000)
pnpm dev

# Build de producción
pnpm build

# Servidor de producción
pnpm start

# Lint y format
pnpm lint
pnpm lint:fix
pnpm format

# Type checking
pnpm type-check
```

## 🧪 Testing

### Playwright (E2E)

```bash
# Ejecutar tests
pnpm test

# UI Mode (recomendado para desarrollo)
pnpm test:ui

# Debug mode
pnpm test:debug
```

## 📁 Estructura del Proyecto

```
context-ai-front/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Route group: Autenticación
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── (protected)/         # Route group: Rutas protegidas
│   │   │   ├── chat/
│   │   │   ├── knowledge/
│   │   │   └── dashboard/
│   │   ├── api/                 # API Routes
│   │   │   └── auth/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── chat/                # Componentes de chat
│   │   ├── knowledge/           # Gestión de conocimiento
│   │   ├── shared/              # Componentes compartidos
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── api/                 # API clients
│   │   ├── providers/           # React providers
│   │   ├── utils/               # Utilidades
│   │   └── auth0.config.ts      # Auth0 config
│   └── stores/                  # Zustand stores
│       ├── user.store.ts
│       └── chat.store.ts
├── tests/                        # Playwright tests
├── public/                       # Archivos estáticos
├── playwright.config.ts          # Configuración Playwright
├── eslint.config.mjs             # Configuración ESLint
├── .prettierrc                   # Configuración Prettier
├── tailwind.config.ts            # Configuración Tailwind
└── tsconfig.json                 # Configuración TypeScript
```

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Inicia servidor de producción |
| `pnpm lint` | Ejecuta ESLint |
| `pnpm lint:fix` | Ejecuta ESLint y corrige errores |
| `pnpm format` | Formatea código con Prettier |
| `pnpm format:check` | Verifica formato |
| `pnpm type-check` | Verifica tipos TypeScript |
| `pnpm test` | Ejecuta tests de Playwright |
| `pnpm test:ui` | Playwright UI mode |
| `pnpm test:debug` | Playwright debug mode |

## 🔄 Integración con Backend

El frontend se comunica con el backend (`context-ai-api`) a través de:

1. **API REST** - Endpoints HTTP en `http://localhost:3001`
2. **Auth0 JWT** - Tokens de autenticación compartidos
3. **DTOs Compartidos** - Paquete `@context-ai/shared`

### Ejemplo de uso:

```typescript
import { apiClient } from '@/lib/api/client';
import { ChatQueryDto, ChatResponseDto } from '@context-ai/shared';

const response = await apiClient.post<ChatResponseDto>(
  '/api/chat',
  queryDto,
  { token: accessToken }
);
```

## 🔒 Seguridad

- ✅ Auth0 con tokens HttpOnly
- ✅ CSRF protection
- ✅ Content Security Policy (CSP)
- ✅ Rate limiting (API)
- ✅ Input validation con Zod
- ✅ Sanitización de inputs

## 🐛 Git Hooks

### Pre-commit
- Ejecuta `lint-staged`
- Formatea código
- Corrige errores de ESLint

### Pre-push
- Verifica tipos TypeScript
- Ejecuta linter

## 📝 Licencia

MIT

---

## 🤝 Contribución

Este proyecto es parte del TFM de la Maestría en IA.

Para más información, consulta la documentación en `/Context.ia/documentation/`.
