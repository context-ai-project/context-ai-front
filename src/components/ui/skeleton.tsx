'use client';

import { cn } from '@/lib/utils';

/**
 * Skeleton component for loading states with shimmer animation.
 * Uses Tailwind CSS for styling and animation.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-12 w-12 rounded-full" />
 * ```
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />;
}

export { Skeleton };
