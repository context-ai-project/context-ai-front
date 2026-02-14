# Code Quality — Context.ai Frontend

## Overview

Code quality is enforced through a combination of ESLint, Prettier, TypeScript strict mode, and Git hooks (Husky + lint-staged). This ensures consistent style, catches errors early, and prevents low-quality code from reaching the repository.

## ESLint Configuration

File: `eslint.config.mjs` (flat config format)

### Config Layers

| Layer | Source | Purpose |
|-------|--------|---------|
| `next/core-web-vitals` | `eslint-config-next` | Next.js best practices + Core Web Vitals + jsx-a11y |
| `next/typescript` | `eslint-config-next` | TypeScript-specific rules |
| `prettier` | `eslint-config-prettier` | Disables formatting rules that conflict with Prettier |
| `sonarjs` | `eslint-plugin-sonarjs` | Code quality and complexity rules |
| `tanstack-query` | `@tanstack/eslint-plugin-query` | React Query best practices |

### Custom Rules

```javascript
rules: {
  // General
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'prefer-const': 'error',

  // TypeScript
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',

  // React
  'react/prop-types': 'off',
  'react/react-in-jsx-scope': 'off',
  'react-hooks/exhaustive-deps': 'warn',

  // Accessibility
  'jsx-a11y/anchor-is-valid': ['error', {
    components: ['Link'],
    specialLink: ['hrefLeft', 'hrefRight'],
    aspects: ['invalidHref', 'preferButton'],
  }],

  // SonarJS
  'sonarjs/cognitive-complexity': ['warn', 15],
  'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
},
```

### Key Rule Explanations

| Rule | Setting | Why |
|------|---------|-----|
| `no-console` | warn (allow warn/error) | Prevents debug `console.log` from reaching production |
| `no-unused-vars` | error (ignore `_` prefix) | Catches dead code; `_` prefix for intentionally unused params |
| `no-explicit-any` | warn | Discourages `any`; warns instead of errors for gradual migration |
| `cognitive-complexity: 15` | warn | Flags overly complex functions for refactoring |
| `no-duplicate-string: 5` | warn | Extracts repeated strings into constants |
| `exhaustive-deps` | warn | Prevents stale closures in `useEffect` |

### Ignored Paths

```javascript
globalIgnores([
  '.next/**',
  'out/**',
  'build/**',
  'next-env.d.ts',
  'node_modules/**',
  'coverage/**',
  'playwright-report/**',
  'test-results/**',
  '*.config.{js,mjs,ts}',
]);
```

## Prettier Configuration

File: `.prettierrc`

Prettier is the single source of truth for formatting. ESLint formatting rules are disabled via `eslint-config-prettier`.

### Tailwind CSS Plugin

```json
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

This plugin automatically sorts Tailwind CSS class names in a consistent order.

## TypeScript

### Strict Mode

TypeScript is configured with strict checks via `tsconfig.json`. Key features:

- **No implicit `any`** — All types must be explicit or inferred
- **Strict null checks** — `null` and `undefined` must be handled
- **Path aliases** — `@/` maps to `src/` for clean imports

### Type Checking Command

```bash
pnpm type-check  # Runs: tsc --noEmit
```

This verifies all TypeScript code compiles without errors, without producing output files.

## Git Hooks (Husky)

### Pre-Commit Hook

Runs `lint-staged` on every commit, which processes only **staged files**:

```json
// package.json
"lint-staged": {
  "src/**/*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "src/**/*.{json,css,md}": [
    "prettier --write"
  ]
}
```

**What happens on `git commit`:**
1. ESLint auto-fixes staged `.ts`/`.tsx` files
2. Prettier formats all staged files
3. If ESLint finds unfixable errors, the commit is **blocked**

### Pre-Push Hook

Runs broader checks before code reaches the remote:

```bash
pnpm type-check              # TypeScript compilation check
pnpm lint                     # Full ESLint across src/
pnpm audit --audit-level=high # Dependency vulnerability scan
```

If any check fails, the push is **blocked**.

### Bypassing Hooks (Emergency Only)

```bash
git commit --no-verify -m "hotfix: urgent fix"
git push --no-verify
```

> ⚠️ Only use `--no-verify` for genuine emergencies. The CI pipeline will still catch issues.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm lint` | Run ESLint on `src/` directory |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Format all source files with Prettier |
| `pnpm format:check` | Check formatting without modifying files |
| `pnpm type-check` | Verify TypeScript compilation (`tsc --noEmit`) |

## Naming Conventions

| Convention | Applies To | Example |
|------------|-----------|---------|
| **PascalCase** | Components, interfaces, types | `UserProfile`, `ChatState` |
| **camelCase** | Variables, functions, hooks | `userName`, `handleSubmit`, `useCurrentUser` |
| **kebab-case** | File and directory names | `user-profile.tsx`, `error-handler.ts` |
| **UPPERCASE** | Constants, environment variables | `API_CONFIG`, `MOBILE_BREAKPOINT` |
| **`use` prefix** | Custom hooks | `useIsMobile`, `useChatStore` |
| **`is/has/can` prefix** | Boolean variables | `isLoading`, `hasError`, `canSubmit` |
| **`handle` prefix** | Event handlers (internal) | `handleSendMessage`, `handleReset` |
| **`on` prefix** | Callback props (from parent) | `onSendMessage`, `onChange` |

## Code Review Checklist

- [ ] Types are properly defined (no `any`)
- [ ] Error handling is comprehensive (loading, error, empty states)
- [ ] Components are accessible (aria-labels, semantic HTML)
- [ ] No `console.log` (use `console.warn` or `console.error`)
- [ ] Unused imports and variables removed
- [ ] Tests are added/updated for new functionality
- [ ] Component is under 200 lines
- [ ] JSDoc added for public functions and components
- [ ] Commit message follows Conventional Commits format

