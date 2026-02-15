'use client';

import { Brain, MessageSquare, Sparkles, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SuggestedQuestions } from './SuggestedQuestions';

interface EmptyStateProps {
  onQuestionClick?: (question: string) => void;
}

/**
 * Feature card configuration — single source of truth for the feature highlights.
 * Adding a new feature only requires appending an entry here.
 */
interface FeatureConfig {
  /** Translation key under `chat.emptyState.features.<key>` */
  key: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tailwind background colour class for the icon circle */
  bgColor: string;
  /** Tailwind text colour class for the icon */
  textColor: string;
}

const FEATURES: readonly FeatureConfig[] = [
  {
    key: 'naturalConversations',
    icon: MessageSquare,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
  },
  {
    key: 'contextAware',
    icon: Sparkles,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
  },
  {
    key: 'sourceCitations',
    icon: MessageSquare,
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
  },
] as const;

/**
 * EmptyState component displays a welcome screen when there are no messages
 * in the chat, including suggested questions to get started.
 *
 * @example
 * ```tsx
 * {messages.length === 0 && <EmptyState onQuestionClick={handleSendMessage} />}
 * ```
 */
export function EmptyState({ onQuestionClick }: EmptyStateProps) {
  const t = useTranslations('chat.emptyState');

  return (
    <div
      className="flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center gap-8 p-8"
      data-testid="empty-state"
    >
      {/* Logo and welcome message */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="from-primary to-primary/60 rounded-full bg-gradient-to-br p-6 shadow-lg">
          <Brain className="h-12 w-12 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{t('welcomeTitle')}</h1>
          <p className="max-w-md text-sm text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="border-primary/20 bg-primary/5 text-primary mt-2 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>{t('badge')}</span>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="w-full max-w-2xl">
        <SuggestedQuestions onQuestionClick={onQuestionClick} />
      </div>

      {/* Feature highlights — driven by the FEATURES array */}
      <div className="mt-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.key}
              className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm"
            >
              <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${feature.bgColor}`}
              >
                <Icon className={`h-6 w-6 ${feature.textColor}`} />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="text-sm text-gray-600">{t(`features.${feature.key}.description`)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
