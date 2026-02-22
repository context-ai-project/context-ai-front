'use client';

import { useEffect, useRef } from 'react';
import { MessageDto, MessageRole, RagResponseType } from '@/types/message.types';
import { Brain, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { StructuredResponse } from './StructuredResponse';
import { SourceList } from './SourceList';
import { TypingIndicator } from './TypingIndicator';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface MessageListProps {
  messages: MessageDto[];
  isLoading: boolean;
}

/**
 * Renders the appropriate message content based on role and response type.
 * Extracted to avoid nested ternary operations.
 */
function MessageContent({ message, isAssistant }: { message: MessageDto; isAssistant: boolean }) {
  if (isAssistant && message.structured) {
    return (
      <StructuredResponse
        data={message.structured}
        className="text-chat-bubble-assistant-foreground"
      />
    );
  }

  if (isAssistant) {
    return (
      <MarkdownRenderer
        content={message.content}
        className="text-chat-bubble-assistant-foreground"
        data-testid="markdown-content"
      />
    );
  }

  return (
    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('chat');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="space-y-6" data-testid="message-list">
      {messages
        .filter((message) => message && message.id && message.role && message.content)
        .map((message) => {
          const isUser = message.role === MessageRole.USER;
          const isAssistant = message.role === MessageRole.ASSISTANT;

          return (
            <div
              key={message.id}
              className={cn('flex gap-4', isUser && 'flex-row-reverse')}
              data-testid={isUser ? 'user-message' : 'assistant-message'}
            >
              {isAssistant ? (
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Brain className="text-primary h-5 w-5" />
                </div>
              ) : (
                <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <User className="text-primary-foreground h-5 w-5" />
                </div>
              )}

              <div
                className={cn(
                  'flex max-w-[75%] flex-col rounded-lg p-4',
                  isUser
                    ? 'bg-chat-bubble-user text-chat-bubble-user-foreground'
                    : 'border-chat-bubble-assistant-border bg-chat-bubble-assistant text-chat-bubble-assistant-foreground border',
                )}
              >
                {/* No-context indicator for fallback responses (v1.3) */}
                {isAssistant && message.responseType === RagResponseType.NO_CONTEXT && (
                  <div
                    className="mb-2 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700"
                    data-testid="no-context-indicator"
                  >
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{t('noContextFound')}</span>
                  </div>
                )}

                {/* Message content — structured or plain (v1.3) */}
                <MessageContent message={message} isAssistant={isAssistant} />

                {/* Sources for assistant messages */}
                {isAssistant && message.sourcesUsed && message.sourcesUsed.length > 0 && (
                  <div className="border-chat-bubble-assistant-border mt-4 border-t pt-4">
                    <SourceList sources={message.sourcesUsed} maxSources={5} />
                  </div>
                )}

                {/* Timestamp - WCAG AA: ≥4.5:1 contrast ratio */}
                <span
                  className={cn(
                    'mt-2 text-right text-xs',
                    isUser ? 'text-chat-bubble-user-muted' : 'text-chat-bubble-assistant-muted',
                  )}
                >
                  {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
            </div>
          );
        })}

      {/* Typing indicator */}
      {isLoading && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
