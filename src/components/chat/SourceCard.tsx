'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';
import type { SourceFragment } from '@/types/message.types';

/**
 * SourceCard component displays a source fragment used by the assistant
 * in its response. Features expandable content and metadata display.
 *
 * @example
 * ```tsx
 * <SourceCard source={sourceFragment} index={0} />
 * ```
 */
interface SourceCardProps {
  source: SourceFragment;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract metadata for display
  const documentTitle = (source.metadata?.title as string | undefined) || `Document ${index + 1}`;
  const page = source.metadata?.page as number | undefined;
  const sourceUrl = source.metadata?.url as string | undefined;

  return (
    <div className="rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors"
          aria-expanded={isExpanded}
          aria-controls={`source-content-${index}`}
        >
          <div className="flex-shrink-0 rounded-full bg-blue-100 p-2">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-medium text-gray-900">{documentTitle}</h4>
              <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {(source.similarity * 100).toFixed(0)}% match
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              {page && <span>Page {page}</span>}
            </div>
          </div>

          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
            aria-label="View source document"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {isExpanded && (
        <div id={`source-content-${index}`} className="border-t border-gray-200 bg-gray-50 p-4">
          <p className="text-sm leading-relaxed text-gray-700">{source.content}</p>

          {source.metadata && Object.keys(source.metadata).length > 0 && (
            <div className="mt-3 space-y-1 border-t border-gray-200 pt-3">
              <p className="text-xs font-semibold text-gray-500">Metadata:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(source.metadata)
                  .filter(([key]) => !['title', 'page', 'url'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium text-gray-600">{key}:</span>{' '}
                      <span className="text-gray-700">{String(value)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
