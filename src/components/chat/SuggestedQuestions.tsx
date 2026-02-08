'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useCurrentSectorId } from '@/stores/user.store';
import { SUGGESTED_QUESTIONS } from '@/constants/suggested-questions';

/**
 * SuggestedQuestions component displays clickable question suggestions
 * to help users get started with the chat.
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
  const currentSectorId = useCurrentSectorId();

  // Get sector-specific questions or default questions
  const questions =
    (currentSectorId && SUGGESTED_QUESTIONS[currentSectorId]) || SUGGESTED_QUESTIONS.default;

  return (
    <div className="space-y-4">
      <h2 className="text-center text-sm font-semibold text-gray-700">Try asking:</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {questions.map((question: string, index: number) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto justify-start gap-3 p-4 text-left hover:border-blue-300 hover:bg-blue-50"
            onClick={() => onQuestionClick?.(question)}
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-blue-600" />
            <span className="text-sm text-gray-700">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
