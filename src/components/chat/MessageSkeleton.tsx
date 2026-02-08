'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton component for loading message states.
 * Shows a placeholder while messages are being loaded.
 *
 * @example
 * ```tsx
 * <MessageSkeleton count={3} />
 * ```
 */
interface MessageSkeletonProps {
  count?: number;
}

export function MessageSkeleton({ count = 3 }: MessageSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          {/* Message content skeleton */}
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
