# Frontend Development Guidelines - Context.ai

You are a senior React/Next.js developer with deep expertise in TypeScript, clean architecture, and modern frontend best practices.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Auth**: Auth0 Next.js SDK
- **UI**: shadcn/ui + Lucide Icons
- **Testing**: Playwright

## General Principles

### Code Standards

1. **Use English** for all code, comments, and documentation
2. **Always declare types** - Avoid `any`, create proper interfaces/types
3. **Use JSDoc** for public functions and components
4. **Functional components** with hooks (no class components)
5. **Server/Client components** - Be explicit with 'use client' when needed

### Nomenclature

- **PascalCase**: Components, interfaces, types (`UserProfile`, `ChatMessage`)
- **camelCase**: Variables, functions, hooks (`userName`, `fetchMessages`, `useUserData`)
- **kebab-case**: File and directory names (`user-profile.tsx`, `chat-container.tsx`)
- **UPPERCASE**: Environment variables and constants (`API_URL`, `MAX_RETRIES`)
- **Prefixes**:
  - `use` for custom hooks (`useAuth`, `useChatMessages`)
  - `is/has/can` for booleans (`isLoading`, `hasError`, `canSubmit`)
  - `handle` for event handlers (`handleSubmit`, `handleClick`)
  - `on` for callback props (`onSave`, `onChange`)

### File Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── (protected)/
│   └── api/
├── components/
│   ├── [feature]/         # Feature-specific components
│   ├── shared/            # Shared across features
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── api/               # API clients
│   ├── hooks/             # Custom hooks
│   ├── providers/         # React providers
│   └── utils/             # Utilities
└── stores/                # Zustand stores
```

## Component Guidelines

### Structure

```typescript
/**
 * Component description
 * @param props - Component props
 */
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState();
  
  // 2. Queries/Mutations (TanStack Query)
  const { data } = useQuery({ ... });
  
  // 3. Event handlers
  const handleAction = () => { ... };
  
  // 4. Effects
  useEffect(() => { ... }, []);
  
  // 5. Early returns
  if (loading) return <Skeleton />;
  if (error) return <ErrorState />;
  
  // 6. Render
  return (...);
}
```

### Best Practices

1. **Keep components small** - < 200 lines
2. **Single responsibility** - One component, one purpose
3. **Extract logic to hooks** - Don't bloat components
4. **Use composition** over prop drilling
5. **Memoize expensive computations** with `useMemo`
6. **Memoize callbacks** with `useCallback` when passed to children
7. **Use `React.memo`** for expensive components that re-render often

### Props

```typescript
// Define props interface
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  className?: string;
}

// Destructure with defaults
export function UserCard({ 
  user, 
  onEdit, 
  className = '' 
}: UserCardProps) {
  // ...
}
```

## State Management

### Local State (useState)

Use for:
- UI state (modals, dropdowns)
- Form inputs
- Component-specific state

### Global State (Zustand)

Use for:
- User authentication
- Chat messages
- Application-wide settings

```typescript
// stores/feature.store.ts
interface FeatureState {
  data: Data | null;
  isLoading: boolean;
  
  setData: (data: Data) => void;
  clearData: () => void;
}

export const useFeatureStore = create<FeatureState>((set) => ({
  data: null,
  isLoading: false,
  
  setData: (data) => set({ data }),
  clearData: () => set({ data: null }),
}));
```

### Server State (TanStack Query)

Use for:
- API data fetching
- Caching
- Background refetching

```typescript
// lib/api/feature.api.ts
export const featureKeys = {
  all: ['features'] as const,
  detail: (id: string) => ['features', id] as const,
};

export function useFeature(id: string) {
  return useQuery({
    queryKey: featureKeys.detail(id),
    queryFn: () => apiClient.get(`/api/features/${id}`),
  });
}
```

## Styling

### Tailwind CSS

```typescript
// Good: Semantic grouping
<div className="
  flex items-center gap-4
  rounded-lg border border-gray-200
  p-4
  hover:bg-gray-50
  transition-colors
">

// Better: Extract to component or use cn()
import { cn } from '@/lib/utils';

<div className={cn(
  'flex items-center gap-4',
  'rounded-lg border border-gray-200',
  isActive && 'bg-blue-50',
  className
)}>
```

### shadcn/ui Components

```typescript
// Import from @/components/ui
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

// Extend with variants
<Button variant="outline" size="lg">
  Click me
</Button>
```

## Data Fetching

### Client Components

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function UserProfile() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const token = await getAccessToken();
      return apiClient.get('/api/user', { token });
    },
  });
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState error={error} />;
  
  return <div>{data.name}</div>;
}
```

### Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateUserDto) =>
      apiClient.put('/api/user', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
```

## Error Handling

```typescript
// API errors
try {
  await apiClient.post('/api/endpoint', data);
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 401) {
      // Handle unauthorized
    }
    toast.error(error.message);
  }
}

// Component error boundaries
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

## Testing

### Playwright E2E Tests

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Performance

1. **Dynamic imports** for heavy components
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

2. **Image optimization** with next/image
```typescript
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={100}
  height={100}
  priority={false}
/>
```

3. **Lazy load images** below the fold
4. **Memoize expensive calculations** with `useMemo`
5. **Debounce search inputs**

## Accessibility

1. **Semantic HTML** - Use proper elements
2. **ARIA labels** - For interactive elements
3. **Keyboard navigation** - All interactions accessible via keyboard
4. **Color contrast** - WCAG AA minimum
5. **Focus management** - Visible focus indicators

```typescript
<button
  aria-label="Close dialog"
  onClick={handleClose}
  className="focus:ring-2 focus:ring-blue-500"
>
  <X className="h-4 w-4" />
</button>
```

## Security

1. **Never store tokens** in localStorage
2. **Use HttpOnly cookies** for Auth0
3. **Sanitize user input** before rendering
4. **Validate all data** with Zod
5. **Use CSP headers**

```typescript
// Validate with Zod
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
});

const validated = schema.parse(formData);
```

## Code Quality

### Before Committing

1. ✅ Run `pnpm lint:fix`
2. ✅ Run `pnpm format`
3. ✅ Run `pnpm type-check`
4. ✅ Write meaningful commit messages
5. ✅ Keep commits atomic and focused

### Code Review Checklist

- [ ] Types are properly defined
- [ ] Error handling is comprehensive
- [ ] Loading states are handled
- [ ] Components are accessible
- [ ] Code is performant
- [ ] Tests are added/updated
- [ ] Documentation is updated

## Common Patterns

### Loading States

```typescript
if (isLoading) {
  return <ComponentSkeleton />;
}

if (error) {
  return <ErrorState error={error} retry={refetch} />;
}

if (!data) {
  return <EmptyState />;
}

return <ComponentContent data={data} />;
```

### Conditional Rendering

```typescript
// Good
{isVisible && <Component />}

// Better (for complex conditions)
const shouldShow = isVisible && hasPermission && !isLoading;
{shouldShow && <Component />}

// Best (extract to computed value)
const content = useMemo(() => {
  if (isLoading) return <Skeleton />;
  if (error) return <Error />;
  return <Content />;
}, [isLoading, error]);
```

## Anti-Patterns to Avoid

❌ Prop drilling (use context or Zustand)
❌ Massive components (split into smaller ones)
❌ Inline styles (use Tailwind)
❌ Imperative DOM manipulation (use React state)
❌ Ignoring TypeScript errors
❌ Not handling loading/error states
❌ Using `any` type
❌ Not cleaning up effects
❌ Not memoizing expensive operations

---

Remember: Write code that is **readable, maintainable, and testable**. When in doubt, favor simplicity and clarity over cleverness.

