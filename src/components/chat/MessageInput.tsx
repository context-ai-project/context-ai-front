'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

/**
 * Message input component - allows user to type and send messages
 * Will be fully implemented in Issue 5.4
 */
export function MessageInput() {
  return (
    <form className="flex gap-2">
      <Textarea
        placeholder="Type your message..."
        className="min-h-[60px] flex-1 resize-none"
        disabled
      />
      <Button type="submit" size="icon" className="h-[60px] w-[60px]" disabled>
        <Send className="h-5 w-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
