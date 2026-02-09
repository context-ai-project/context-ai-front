/**
 * Image optimization configuration for Next.js
 */

/**
 * Image sizes for responsive images
 */
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

/**
 * Image quality settings
 */
export const IMAGE_QUALITY = {
  avatar: 90,
  logo: 95,
  content: 85,
  thumbnail: 75,
} as const;

/**
 * Placeholder blur data URL (gray)
 */
export const PLACEHOLDER_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPgo8L3N2Zz4=';

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(src: string, sizes: number[]): string {
  return sizes.map((size) => `${src}?w=${size} ${size}w`).join(', ');
}

/**
 * Get optimal image size based on device pixel ratio
 */
export function getOptimalSize(baseSize: number, dpr = 1): number {
  return Math.min(baseSize * dpr, baseSize * 3);
}
