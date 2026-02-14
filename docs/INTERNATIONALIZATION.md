# Internationalization (i18n) — Context.ai Frontend

## Overview

The application supports **Spanish (es)** and **English (en)** using `next-intl` with the Next.js App Router. All user-facing routes include a locale prefix (`/es/chat`, `/en/dashboard`) and translations are loaded server-side.

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    Middleware     │────▶│  Locale Layout   │────▶│    Components    │
│ next-intl/middle │     │ NextIntlClient   │     │ useTranslations  │
│ ware             │     │ Provider         │     │ useLocale        │
│                  │     │                  │     │                  │
│ Detects locale   │     │ Loads messages   │     │ Renders text     │
│ from URL path    │     │ for locale       │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## Configuration

### Supported Locales (`src/i18n.ts`)

```typescript
export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
```

### Message Loading

Messages are loaded dynamically based on the request locale:

```typescript
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

### Middleware (`middleware.ts`)

The middleware handles locale routing and sets cache-control headers:

```typescript
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',       // Always include locale in URL
  localeDetection: false,        // Don't auto-detect browser locale
});
```

**Matcher** — Applies to all paths except:
- `/api/*` (API routes)
- `/_next/static/*`, `/_next/image/*` (Next.js internals)
- Static assets (`.svg`, `.png`, `.jpg`, etc.)
- `favicon.ico`, `robots.txt`, `manifest.json`

## Message Files

```
messages/
├── en.json    # English translations
└── es.json    # Spanish translations
```

### Message Structure

Messages are organized by feature namespace:

```json
{
  "common": {
    "appName": "Context.ai",
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "cancel": "Cancel",
    "send": "Send"
  },
  "nav": {
    "dashboard": "Dashboard",
    "chat": "Chat",
    "knowledge": "Knowledge Base",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "chat": {
    "title": "Assistant Chat",
    "placeholder": "Type your message...",
    "emptyState": {
      "title": "Welcome to Context.AI Chat!",
      "description": "..."
    },
    "errors": {
      "networkError": "Network error...",
      "authError": "Authentication failed..."
    },
    "sources": {
      "title": "Sources:",
      "andMore": "And {count} more sources."
    }
  },
  "landing": { "..." },
  "dashboard": { "..." },
  "user": { "..." },
  "auth": { "..." },
  "language": { "..." },
  "accessibility": { "..." },
  "suggestedQuestions": { "..." }
}
```

### Available Namespaces

| Namespace | Content |
|-----------|---------|
| `common` | Shared labels (Loading, Error, Save, Cancel, etc.) |
| `nav` | Navigation items (Dashboard, Chat, Knowledge Base) |
| `chat` | Chat interface (placeholder, errors, sources, input hints) |
| `user` | User profile (sector, role, email) |
| `sector` | Sector names (HR, Engineering, Sales) |
| `auth` | Authentication (sign in, sign out, welcome) |
| `errors` | Error boundary messages |
| `suggestedQuestions` | Quick-start questions by category |
| `language` | Language selector labels |
| `accessibility` | ARIA labels and screen reader text |
| `landing` | Landing page (hero, features, how it works, use cases, CTA, footer) |
| `dashboard` | Dashboard (stats, coming soon) |

## Usage in Components

### Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function ChatEmptyState() {
  const t = useTranslations('chat');

  return (
    <div>
      <h2>{t('emptyState.title')}</h2>
      <p>{t('emptyState.description')}</p>
    </div>
  );
}
```

### With Interpolation

```typescript
const t = useTranslations('chat.sources');

// Message: "And {count} more sources."
<p>{t('andMore', { count: 5 })}</p>
// Output: "And 5 more sources."
```

### Getting Current Locale

```typescript
import { useLocale } from 'next-intl';

export function LanguageSelector() {
  const locale = useLocale(); // 'en' or 'es'
  // ...
}
```

## Provider Setup

Messages are provided via `NextIntlClientProvider` in the locale layout:

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
```

## Language Switcher

The `LanguageSelector` component (`components/shared/LanguageSelector.tsx`) allows users to switch languages. It is placed in the protected layout header.

Switching locale triggers a navigation to the same path with a different locale prefix:

```
/es/chat → Click "English" → /en/chat
/en/dashboard → Click "Español" → /es/dashboard
```

## Adding a New Language

1. **Add locale to config** (`src/i18n.ts`):

```typescript
export const locales = ['en', 'es', 'fr'] as const;
```

2. **Create message file** (`messages/fr.json`):

Copy `messages/en.json` and translate all values.

3. **Update middleware locale list** — Automatically picked up from `i18n.ts`.

4. **Update LanguageSelector** — Add the new locale option to the selector component.

5. **Update locale layout validation**:

```typescript
// src/app/[locale]/layout.tsx
const locales = ['en', 'es', 'fr'];
```

## Testing

In unit tests, `next-intl` is mocked globally in `src/test/setup.ts`:

```typescript
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,  // Returns the key as text
  useLocale: () => 'en',
}));
```

This means in tests, translated text shows as the **message key** (e.g., `chat.emptyState.title`), not the actual translated string. Use `getByText('chat.emptyState.title')` in test assertions.

## URL Structure

| URL | Locale | Page |
|-----|--------|------|
| `/es` | Spanish | Landing page |
| `/en` | English | Landing page |
| `/es/chat` | Spanish | Chat |
| `/en/dashboard` | English | Dashboard |
| `/es/knowledge` | Spanish | Knowledge management |
| `/es/auth/signin` | Spanish | Sign in page |

