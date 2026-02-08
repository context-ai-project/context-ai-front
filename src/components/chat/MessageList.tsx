'use client';

import { useEffect, useRef } from 'react';
import { useMessages, useIsLoading } from '@/stores/chat.store';
import { MessageRole, MessageDto, SourceFragment } from '@/types/message.types';
import { Bot, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Message list component - displays chat messages with auto-scroll
 * Issue 5.3: Message List Component
 */
export function MessageList() {
  const messages = useMessages();
  const isLoading = useIsLoading();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Empty state - no messages yet
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <Bot className="mb-4 h-16 w-16 text-gray-300" />
        <p className="text-lg font-medium">No messages yet</p>
        <p className="text-sm">Start a conversation with Context.AI!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {messages.map((message: MessageDto) => {
        const isUser = message.role === MessageRole.USER;
        const isAssistant = message.role === MessageRole.ASSISTANT;

        return (
          <div
            key={message.id}
            className={cn('flex gap-3', isUser && 'flex-row-reverse', isAssistant && 'flex-row')}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                isUser && 'bg-blue-500',
                isAssistant && 'bg-gray-700',
              )}
            >
              {isUser ? (
                <User className="h-5 w-5 text-white" />
              ) : (
                <Bot className="h-5 w-5 text-white" />
              )}
            </div>

            {/* Message content */}
            <div
              className={cn(
                'flex max-w-[70%] flex-col gap-2',
                isUser && 'items-end',
                isAssistant && 'items-start',
              )}
            >
              {/* Message bubble */}
              <div
                className={cn(
                  'rounded-2xl px-4 py-3',
                  isUser && 'bg-blue-500 text-white',
                  isAssistant && 'bg-gray-100 text-gray-900',
                )}
              >
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-gray-400">
                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>

              {/* Sources (only for assistant messages) */}
              {isAssistant && message.sourcesUsed && message.sourcesUsed.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>Sources used ({message.sourcesUsed.length})</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {message.sourcesUsed.slice(0, 3).map((source: SourceFragment) => (
                      <div
                        key={source.id}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-xs"
                      >
                        <p className="line-clamp-2 text-gray-600">{source.content}</p>
                        <p className="mt-1 text-gray-400">
                          Similarity: {(source.similarity * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                    {message.sourcesUsed.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{message.sourcesUsed.length - 3} more sources
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Loading indicator - typing animation */}
      {isLoading && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
            </div>
            <span className="text-sm text-gray-500">Thinking...</span>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
