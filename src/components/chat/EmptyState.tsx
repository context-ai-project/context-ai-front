'use client';

import { Brain, MessageSquare, Sparkles } from 'lucide-react';
import { SuggestedQuestions } from './SuggestedQuestions';

interface EmptyStateProps {
  onQuestionClick?: (question: string) => void;
}

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
  return (
    <div className="flex min-h-[calc(100vh-20rem)] flex-col items-center justify-center gap-8 p-8">
      {/* Logo and welcome message */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="from-primary to-primary/60 rounded-full bg-gradient-to-br p-6 shadow-lg">
          <Brain className="h-12 w-12 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Context.ai</h1>
          <p className="max-w-md text-lg text-gray-600">
            Your intelligent knowledge assistant powered by RAG technology
          </p>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <Sparkles className="h-4 w-4" />
          <span>Ask me anything about your documents</span>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="w-full max-w-2xl">
        <SuggestedQuestions onQuestionClick={onQuestionClick} />
      </div>

      {/* Feature highlights */}
      <div className="mt-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mb-2 font-semibold text-gray-900">Natural Conversations</h3>
          <p className="text-sm text-gray-600">
            Ask questions in plain language and get accurate answers
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="mb-2 font-semibold text-gray-900">Context-Aware</h3>
          <p className="text-sm text-gray-600">
            Responses based on your organization&apos;s knowledge base
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <MessageSquare className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mb-2 font-semibold text-gray-900">Source Citations</h3>
          <p className="text-sm text-gray-600">
            Every answer includes references to source documents
          </p>
        </div>
      </div>
    </div>
  );
}
