'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2 } from 'lucide-react';
import { useIsLoading, useClearMessages } from '@/stores/chat.store';
import { cn } from '@/lib/utils';

/**
 * Message input component - allows user to type and send messages
 * Issue 5.4: Message Input Component
 */

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  onClearConversation?: () => void;
}

/**
 * Render a message composer with an auto-resizing textarea, character-count validation, and controls to send or clear the conversation.
 *
 * The component enforces minimum and maximum message lengths, disables input while a response is loading, supports Enter to send (Shift+Enter for a newline), and presents accessible feedback for character-limit violations.
 *
 * @param onSendMessage - Optional callback invoked with the trimmed message when the user sends a valid message.
 * @param onClearConversation - Optional callback invoked after the conversation is cleared following user confirmation.
 * @returns The rendered message input React element.
 */
export function MessageInput({ onSendMessage, onClearConversation }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = useIsLoading();
  const clearMessages = useClearMessages();

  // Auto-grow textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Validation
  const isMessageValid =
    message.trim().length >= MIN_MESSAGE_LENGTH && message.length <= MAX_MESSAGE_LENGTH;
  const canSend = isMessageValid && !isLoading;

  // Character count
  const charCount = message.length;
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.8;
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH;

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSend) return;

    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage?.(trimmedMessage);
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle Enter key (send) vs Shift+Enter (new line)
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  };

  // Handle clear conversation
  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      clearMessages();
      setMessage('');
      onClearConversation?.();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Character counter (only shown when typing) */}
      {isFocused && charCount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Press <kbd className="rounded bg-gray-100 px-1 py-0.5">Enter</kbd> to send,{' '}
            <kbd className="rounded bg-gray-100 px-1 py-0.5">Shift+Enter</kbd> for new line
          </span>
          <span
            className={cn(
              'font-medium',
              isOverLimit && 'text-red-500',
              isNearLimit && !isOverLimit && 'text-yellow-500',
              !isNearLimit && 'text-gray-400',
            )}
          >
            {charCount} / {MAX_MESSAGE_LENGTH}
          </span>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isLoading ? 'Waiting for response...' : 'Type your message... (press Enter to send)'
          }
          className={cn(
            'max-h-[200px] min-h-[60px] flex-1 resize-none transition-colors',
            isOverLimit && 'border-red-300 focus-visible:ring-red-500',
          )}
          disabled={isLoading}
          aria-label="Message input"
          aria-invalid={isOverLimit}
          aria-describedby={isOverLimit ? 'char-limit-error' : undefined}
        />

        <div className="flex flex-col gap-2">
          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            className="h-[60px] w-[60px]"
            disabled={!canSend}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>

          {/* Clear conversation button */}
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-[60px] w-[60px]"
            onClick={handleClearConversation}
            disabled={isLoading}
            aria-label="Clear conversation"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {/* Error message for character limit */}
      {isOverLimit && (
        <p id="char-limit-error" className="text-xs text-red-500">
          Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters. Please shorten your
          message.
        </p>
      )}
    </div>
  );
}