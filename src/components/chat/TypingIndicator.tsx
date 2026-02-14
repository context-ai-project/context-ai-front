'use client';

import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';

/**
 * TypingIndicator component displays an animated "typing..." indicator
 * to show that the assistant is generating a response.
 *
 * @example
 * ```tsx
 * {isLoading && <TypingIndicator />}
 * ```
 */
interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn('flex gap-3', className)}
      role="status"
      aria-live="polite"
      data-testid="typing-indicator"
    >
      <UserAvatar user={{ name: 'Assistant' }} />
      <div className="flex flex-col rounded-lg bg-gray-100 p-4">
        <div className="flex items-center gap-1">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <span className="mt-2 text-xs text-gray-500">Assistant is typing...</span>
      </div>
    </div>
  );
}
