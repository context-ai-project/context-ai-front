'use client';

import type { StructuredRagResponse } from '@/types/message.types';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { Info, ListOrdered, AlertTriangle, Lightbulb } from 'lucide-react';

const SECTION_ICONS = {
  info: Info,
  steps: ListOrdered,
  warning: AlertTriangle,
  tip: Lightbulb,
} as const;

const SECTION_STYLES = {
  info: 'border-blue-200 bg-blue-50/50',
  steps: 'border-emerald-200 bg-emerald-50/50',
  warning: 'border-amber-200 bg-amber-50/50',
  tip: 'border-violet-200 bg-violet-50/50',
} as const;

interface StructuredResponseProps {
  data: StructuredRagResponse;
  className?: string;
}

/**
 * Renders a structured RAG response with summary, sections, key points, and related topics.
 * Section types (info, steps, warning, tip) get distinct visual treatment.
 */
/** Normalize string for safe comparison: trim, collapse spaces, lowercase. Avoids ReDoS. */
function normalizeForCompare(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Hide internal "type: info" entries. Uses string comparison instead of backtracking regex. */
function isInternalTypeLine(value: string): boolean {
  const n = normalizeForCompare(value);
  return n === 'type: info' || n === '"type":"info"';
}

function isTypeInfoOnlyLine(line: string): boolean {
  let t = line.trim();
  const bullet = t.charAt(0);
  if (bullet === '•' || bullet === '-' || bullet === '*') t = t.slice(1).trim();
  const n = normalizeForCompare(t);
  return n === 'type: info' || n === '"type":"info"';
}

/** Remove lines that are only "type: info" (or bullet variants). Non-backtracking. */
function sanitizeStructuredText(text: string): string {
  if (!text?.trim()) return text;
  return text
    .split('\n')
    .filter((line) => !isTypeInfoOnlyLine(line))
    .join('\n');
}

export function StructuredResponse({ data, className }: StructuredResponseProps) {
  const { summary, sections, keyPoints, relatedTopics } = data;
  const filteredKeyPoints = keyPoints?.filter((p) => !isInternalTypeLine(p));

  return (
    <div className={cn('space-y-4', className)} data-testid="structured-response">
      {/* Brief summary */}
      <div className="text-sm leading-relaxed" data-testid="structured-summary">
        <MarkdownRenderer content={sanitizeStructuredText(summary)} />
      </div>

      {/* Sections with type-based styling */}
      {sections && sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const Icon = SECTION_ICONS[section.type] ?? Info;
            const style = SECTION_STYLES[section.type] ?? SECTION_STYLES.info;
            return (
              <div
                key={index}
                className={cn('rounded-lg border p-4', style)}
                data-testid={`section-${section.type}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                </div>
                <div className="text-sm leading-relaxed">
                  <MarkdownRenderer content={sanitizeStructuredText(section.content)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key takeaways */}
      {filteredKeyPoints && filteredKeyPoints.length > 0 && (
        <div data-testid="key-points">
          <h5 className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">
            Key takeaways
          </h5>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {filteredKeyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Related topics */}
      {relatedTopics && relatedTopics.length > 0 && (
        <div data-testid="related-topics">
          <h5 className="mb-2 text-xs font-semibold tracking-wide text-gray-600 uppercase">
            Related topics
          </h5>
          <p className="text-sm text-gray-600">
            {relatedTopics.map((topic, index) => (
              <span key={index}>
                {index > 0 && ' • '}
                <span>{topic}</span>
              </span>
            ))}
          </p>
        </div>
      )}
    </div>
  );
}
