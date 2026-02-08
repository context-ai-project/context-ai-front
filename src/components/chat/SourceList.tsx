'use client';

import { SourceCard } from './SourceCard';
import type { SourceFragment } from '@/types/message.types';
import { FileText } from 'lucide-react';

/**
 * SourceList component displays a list of source fragments
 * used by the assistant in its response.
 *
 * @example
 * ```tsx
 * <SourceList sources={message.sourcesUsed} maxSources={5} />
 * ```
 */
interface SourceListProps {
  sources: SourceFragment[];
  maxSources?: number;
}

export function SourceList({ sources, maxSources = 5 }: SourceListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const displayedSources = sources.slice(0, maxSources);
  const remainingCount = sources.length - maxSources;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <FileText className="h-4 w-4" />
        <span>Sources ({sources.length})</span>
      </div>

      <div className="space-y-2">
        {displayedSources.map((source, index) => (
          <SourceCard key={source.id || index} source={source} index={index} />
        ))}
      </div>

      {remainingCount > 0 && (
        <p className="text-center text-xs text-gray-500">
          and {remainingCount} more source{remainingCount !== 1 ? 's' : ''}...
        </p>
      )}
    </div>
  );
}
