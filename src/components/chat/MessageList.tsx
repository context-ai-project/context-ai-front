'use client';

import { useEffect, useRef } from 'react';
import { MessageDto, MessageRole } from '@/types/message.types';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { SourceList } from './SourceList';
import { TypingIndicator } from './TypingIndicator';
import { format } from 'date-fns';

interface MessageListProps {
  messages: MessageDto[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="space-y-6">
      {messages
        .filter((message) => message && message.id && message.role && message.content)
        .map((message) => {
          const isUser = message.role === MessageRole.USER;
          const isAssistant = message.role === MessageRole.ASSISTANT;
          const user = { name: isUser ? 'You' : 'Assistant', picture: null };

          return (
            <div key={message.id} className={cn('flex gap-4', isUser && 'flex-row-reverse')}>
              <UserAvatar user={user} />

              <div
                className={cn(
                  'flex max-w-[75%] flex-col rounded-lg p-4',
                  isUser
                    ? 'bg-blue-500 text-white'
                    : 'border border-gray-200 bg-white text-gray-800',
                )}
              >
                {/* Message content */}
                {isAssistant ? (
                  <MarkdownRenderer content={message.content} className="text-gray-800" />
                ) : (
                  <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {message.content}
                  </p>
                )}

                {/* Sources for assistant messages */}
                {isAssistant && message.sourcesUsed && message.sourcesUsed.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <SourceList sources={message.sourcesUsed} maxSources={5} />
                  </div>
                )}

                {/* Timestamp */}
                <span
                  className={cn(
                    'mt-2 text-right text-xs',
                    isUser ? 'text-blue-200' : 'text-gray-500',
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
