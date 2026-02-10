# Image Optimization - Context.ai Frontend

## Overview

This document describes the image optimization strategy implemented in the Context.ai frontend using Next.js Image component and custom optimization utilities.

## Components

### 1. OptimizedImage Component

Location: `src/components/ui/OptimizedImage.tsx`

A wrapper around Next.js `Image` component that provides:
- ✅ Automatic lazy loading
- ✅ Blur placeholder while loading
- ✅ Aspect ratio handling
- ✅ Error fallback
- ✅ Loading state animation

#### Usage

```tsx
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  src="/logo.png"
  alt="Company logo"
  width={200}
  height={200}
  aspectRatio="square"
  priority={false}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Image source URL |
| `alt` | `string` | required | Alt text for accessibility |
| `width` | `number` | required | Image width |
| `height` | `number` | required | Image height |
| `fallback` | `string` | `/images/placeholder.png` | Fallback image on error |
| `aspectRatio` | `'square' \| '16/9' \| '4/3' \| 'video' \| 'auto'` | `'auto'` | Aspect ratio |
| `priority` | `boolean` | `false` | Load image with priority |
| `className` | `string` | - | Additional CSS classes |

#### Features

**Loading State**
- Shows animated pulse effect while loading
- Smooth fade-in transition when loaded

**Error Handling**
- Automatically falls back to placeholder image on error
- Graceful degradation

**Aspect Ratio**
- Pre-defined aspect ratios for common use cases
- Prevents layout shift during loading

### 2. UserAvatar Component

Location: `src/components/shared/UserAvatar.tsx`

Optimized avatar component using Radix UI Avatar primitive:
- ✅ Automatic fallback to user initials
- ✅ Multiple size variants
- ✅ Lazy loading for remote images
- ✅ Rounded styling

#### Usage

```tsx
import { UserAvatar } from '@/components/shared/UserAvatar';

<UserAvatar 
  user={user} 
  size="md" 
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `{ name: string, picture?: string }` | - | User object |
| `src` | `string` | - | Direct image source (optional) |
| `alt` | `string` | - | Alt text (optional) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size |

#### Size Map

| Size | Dimensions | Use Case |
|------|------------|----------|
| `sm` | 32px (h-8 w-8) | Compact lists, mentions |
| `md` | 40px (h-10 w-10) | Default, chat messages |
| `lg` | 56px (h-14 w-14) | Profile pages, headers |

## Configuration

### 1. Image Config

Location: `src/lib/utils/image-config.ts`

Centralized configuration for image sizes and quality settings.

#### Image Sizes

```typescript
export const IMAGE_SIZES = {
  avatar: {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  },
  logo: {
    sm: 120,
    md: 180,
    lg: 240,
  },
  thumbnail: {
    sm: 150,
    md: 300,
    lg: 450,
  },
} as const;
```

#### Image Quality

```typescript
export const IMAGE_QUALITY = {
  avatar: 90,      // High quality for profile pictures
  logo: 95,        // Highest quality for branding
  content: 85,     // Balanced for content images
  thumbnail: 75,   // Lower for thumbnails
} as const;
```

#### Utility Functions

**Generate SrcSet**
```typescript
generateSrcSet(src: string, sizes: number[]): string
```

**Get Optimal Size**
```typescript
getOptimalSize(baseSize: number, dpr = 1): number
```

### 2. Next.js Config

Location: `next.config.ts`

Configured remote image patterns for external sources:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.auth0.com',
      },
    ],
  },
};
```

## Placeholder Images

### SVG Placeholder

Location: `public/images/placeholder.svg`

Lightweight SVG placeholder used while images load or on error.

### Blur Data URL

Built-in base64-encoded blur placeholder:

```typescript
const PLACEHOLDER_BLUR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPgo8L3N2Zz4=';
```

## Usage Examples

### 1. Avatar in Chat

```tsx
<UserAvatar 
  user={{ name: 'John Doe', picture: 'https://example.com/avatar.jpg' }}
  size="md"
/>
```

### 2. Logo in Navbar

```tsx
<OptimizedImage
  src="/logo.png"
  alt="Context.ai Logo"
  width={180}
  height={60}
  priority={true}
  aspectRatio="auto"
/>
```

### 3. Content Image

```tsx
<OptimizedImage
  src="/content/feature.png"
  alt="Feature screenshot"
  width={600}
  height={400}
  aspectRatio="16/9"
  fallback="/images/placeholder.svg"
/>
```

### 4. Thumbnail Grid

```tsx
{images.map((img) => (
  <OptimizedImage
    key={img.id}
    src={img.url}
    alt={img.alt}
    width={300}
    height={300}
    aspectRatio="square"
  />
))}
```

## Performance Benefits

### 1. Automatic Optimization

Next.js Image automatically:
- ✅ Serves images in modern formats (WebP, AVIF)
- ✅ Resizes images to requested dimensions
- ✅ Generates responsive image srcsets
- ✅ Lazy loads images below the fold

### 2. Reduced Layout Shift

- Aspect ratio containers prevent CLS
- Width/height props reserve space
- Smooth loading transitions

### 3. Bandwidth Savings

- Only loads images when needed (lazy loading)
- Serves optimally sized images
- Uses modern, smaller image formats

### 4. Caching

- Automatic browser caching
- CDN-friendly headers
- Efficient cache invalidation

## Best Practices

### 1. Always Provide Alt Text

```tsx
// ✅ Good
<OptimizedImage src="/logo.png" alt="Context.ai Logo" />

// ❌ Bad
<OptimizedImage src="/logo.png" alt="" />
```

### 2. Use Priority for Above-the-Fold Images

```tsx
// ✅ Good - Logo in header
<OptimizedImage src="/logo.png" alt="Logo" priority={true} />

// ✅ Good - Below the fold
<OptimizedImage src="/feature.png" alt="Feature" priority={false} />
```

### 3. Choose Appropriate Aspect Ratios

```tsx
// ✅ Good - Consistent aspect ratio
<OptimizedImage aspectRatio="square" />

// ❌ Bad - No aspect ratio (causes layout shift)
<OptimizedImage aspectRatio="auto" />
```

### 4. Provide Fallbacks

```tsx
// ✅ Good
<OptimizedImage 
  src={user.avatar} 
  fallback="/images/placeholder.svg" 
/>

// ❌ Bad - No fallback
<OptimizedImage src={user.avatar} />
```

### 5. Use Appropriate Quality Settings

```tsx
// ✅ Good - High quality for logos
<OptimizedImage quality={IMAGE_QUALITY.logo} />

// ✅ Good - Lower quality for thumbnails
<OptimizedImage quality={IMAGE_QUALITY.thumbnail} />
```

## Accessibility

### 1. Alt Text Guidelines

- **Descriptive**: Describe the image content
- **Concise**: Keep it short and meaningful
- **Context-aware**: Consider surrounding content
- **Empty for decorative**: Use `alt=""` for purely decorative images

### 2. Loading States

- Provide visual feedback during loading
- Ensure content is accessible while loading
- Avoid blocking interactions

### 3. Error States

- Provide meaningful fallback images
- Ensure fallback images have proper alt text
- Consider providing text alternatives

## Monitoring

### Metrics to Track

1. **Largest Contentful Paint (LCP)**
   - Target: < 2.5s
   - Affected by: Priority images, lazy loading

2. **Cumulative Layout Shift (CLS)**
   - Target: < 0.1
   - Affected by: Aspect ratios, width/height props

3. **Image Load Time**
   - Target: < 3s
   - Affected by: Image size, format, caching

4. **Bandwidth Usage**
   - Track: Total image bytes transferred
   - Optimize: Use appropriate sizes and formats

## Future Improvements

- [ ] Add image blur hash generation
- [ ] Implement art direction (different images for different viewports)
- [ ] Add image CDN integration
- [ ] Implement progressive image loading
- [ ] Add image format detection and serving
- [ ] Add image compression optimization
- [ ] Add image lazy loading threshold configuration

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Radix UI Avatar](https://www.radix-ui.com/primitives/docs/components/avatar)

