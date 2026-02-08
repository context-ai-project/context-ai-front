'use client';

import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

/**
 * Main chat container with responsive layout
 * Handles the overall structure of the chat interface
 */
export function ChatContainer() {
  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Messages area - scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList />
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
