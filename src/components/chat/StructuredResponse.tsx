'use client';

import { Info, ListOrdered, AlertTriangle, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import type {
  StructuredResponse as StructuredResponseType,
  SectionType,
} from '@/types/message.types';

/**
 * Configuration for section type visual styling
 */
interface SectionConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
}

const SECTION_CONFIG: Record<SectionType, SectionConfig> = {
  info: {
    icon: Info,
    label: 'Information',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50/50',
    iconColor: 'text-blue-500',
  },
  steps: {
    icon: ListOrdered,
    label: 'Steps',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50/50',
    iconColor: 'text-emerald-500',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Important',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/50',
    iconColor: 'text-amber-500',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    borderColor: 'border-violet-200',
    bgColor: 'bg-violet-50/50',
    iconColor: 'text-violet-500',
  },
};

interface StructuredResponseProps {
  data: StructuredResponseType;
  className?: string;
}

/**
 * StructuredResponse renders an AI response organized into typed sections.
 *
 * Displays a summary, sections with visual indicators, key points, and
 * related topics. Falls back gracefully if any part is missing.
 *
 * @param data - The structured response from the API
 * @param className - Optional additional class names
 */
export function StructuredResponse({ data, className }: StructuredResponseProps) {
  const { summary, sections, keyPoints, relatedTopics } = data;

  return (
    <div className={cn('space-y-4', className)} data-testid="structured-response">
      {/* Summary */}
      <div className="text-sm leading-relaxed font-medium" data-testid="structured-summary">
        <MarkdownRenderer content={summary} />
      </div>

      {/* Sections */}
      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const config = SECTION_CONFIG[section.type] ?? SECTION_CONFIG.info;
            const Icon = config.icon;

            return (
              <div
                key={`${section.type}-${index}`}
                className={cn('rounded-lg border-l-4 p-3', config.borderColor, config.bgColor)}
                data-testid={`section-${section.type}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <Icon className={cn('h-4 w-4', config.iconColor)} aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    {section.title}
                  </span>
                </div>
                <div className="text-sm">
                  <MarkdownRenderer content={section.content} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Key Points */}
      {keyPoints && keyPoints.length > 0 && (
        <div
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
          data-testid="key-points"
        >
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gray-500" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              Key Points
            </span>
          </div>
          <ul className="space-y-1">
            {keyPoints.map((point, index) => (
              <li key={`kp-${index}`} className="flex items-start gap-2 text-sm text-gray-700">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Topics */}
      {relatedTopics && relatedTopics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" data-testid="related-topics">
          <span className="text-xs text-gray-400">Related:</span>
          {relatedTopics.map((topic, index) => (
            <span
              key={`rt-${index}`}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
            >
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
