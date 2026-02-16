'use client';

import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
        <Brain className="text-primary h-5 w-5" />
      </div>
      <div className="bg-muted flex flex-col rounded-lg p-4">
        <div className="flex items-center gap-1">
          <div
            className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="bg-muted-foreground/50 h-2 w-2 animate-bounce rounded-full"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <span className="text-muted-foreground mt-2 text-xs">Assistant is typing...</span>
      </div>
    </div>
  );
}
