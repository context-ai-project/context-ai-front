'use client';

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Send, Trash2, MessageSquareOff } from 'lucide-react';
import { useIsLoading, useClearMessages } from '@/stores/chat.store';
import { cn } from '@/lib/utils';

/**
 * Message input component - allows user to type and send messages
 * Issue 5.4: Message Input Component
 */

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;
/** Threshold (80%) at which the character counter changes to warning color */
const NEAR_LIMIT_THRESHOLD = 0.8;

interface MessageInputProps {
  onSendMessage?: (message: string) => void;
  onClearConversation?: () => void;
}

export function MessageInput({ onSendMessage, onClearConversation }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isLoading = useIsLoading();
  const clearMessages = useClearMessages();
  const t = useTranslations('chat');

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
  const isNearLimit = charCount > MAX_MESSAGE_LENGTH * NEAR_LIMIT_THRESHOLD;
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

  // Handle clear conversation (called from AlertDialog confirm)
  const handleClearConversation = () => {
    clearMessages();
    setMessage('');
    onClearConversation?.();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Character counter (only shown when typing) */}
      {isFocused && charCount > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {t('input.enterToSend')} · {t('input.shiftEnterForNewLine')}
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
          placeholder={isLoading ? t('placeholderLoading') : t('placeholder')}
          className={cn(
            'max-h-[200px] min-h-[60px] flex-1 resize-none transition-colors',
            isOverLimit && 'border-red-300 focus-visible:ring-red-500',
          )}
          disabled={isLoading}
          aria-label="Message input"
          aria-invalid={isOverLimit}
          aria-describedby={isOverLimit ? 'char-limit-error' : undefined}
          data-testid="message-input"
        />

        <div className="flex flex-col gap-2">
          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            className="h-[60px] w-[60px]"
            disabled={!canSend}
            aria-label="Send message"
            data-testid="send-button"
          >
            <Send className="h-5 w-5" />
          </Button>

          {/* Clear conversation button with confirmation dialog */}
          {onClearConversation && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-[60px] w-[60px]"
                  disabled={isLoading}
                  aria-label={t('clear')}
                  data-testid="clear-button"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <MessageSquareOff className="text-destructive h-6 w-6" />
                  </div>
                  <AlertDialogTitle className="text-center">
                    {t('clearDialog.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    {t('clearDialog.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                  <AlertDialogCancel>{t('clearDialog.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearConversation}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('clearDialog.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>

      {/* Error message for character limit */}
      {isOverLimit && (
        <p id="char-limit-error" className="text-xs text-red-500">
          {t('input.characterLimit', { max: MAX_MESSAGE_LENGTH })}
        </p>
      )}
    </div>
  );
}
