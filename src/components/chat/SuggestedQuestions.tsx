'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCurrentSectorId, useSectors } from '@/stores/user.store';
import { SUGGESTED_QUESTION_KEYS, normalizeSectorName } from '@/constants/suggested-questions';

/**
 * SuggestedQuestions component displays clickable question suggestions
 * to help users get started with the chat.
 *
 * Resolves sector-specific questions by looking up the current sector's
 * **name** (not UUID) so the mapping is resilient to backend ID changes.
 *
 * @example
 * ```tsx
 * <SuggestedQuestions onQuestionClick={(q) => sendMessage(q)} />
 * ```
 */
interface SuggestedQuestionsProps {
  onQuestionClick?: (question: string) => void;
}

export function SuggestedQuestions({ onQuestionClick }: SuggestedQuestionsProps) {
  const tEmpty = useTranslations('chat.emptyState');
  const tQuestions = useTranslations('suggestedQuestions');
  const currentSectorId = useCurrentSectorId();
  const sectors = useSectors();

  // Resolve the current sector's name from the store, then look up questions by name
  const currentSectorName = currentSectorId
    ? sectors.find((s) => s.id === currentSectorId)?.name
    : undefined;

  const questionKeys = currentSectorName
    ? (SUGGESTED_QUESTION_KEYS[normalizeSectorName(currentSectorName)] ??
      SUGGESTED_QUESTION_KEYS.default)
    : SUGGESTED_QUESTION_KEYS.default;

  return (
    <div className="space-y-4">
      <h2 className="text-center text-sm font-semibold text-gray-700">{tEmpty('tryAsking')}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {questionKeys.map((key: string) => {
          const question = tQuestions(key);
          return (
            <Button
              key={key}
              variant="outline"
              className="h-auto min-h-[3rem] items-start justify-start gap-3 p-4 text-left whitespace-normal hover:border-blue-300 hover:bg-blue-50"
              onClick={() => onQuestionClick?.(question)}
            >
              <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span className="text-sm break-words text-gray-700">{question}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
