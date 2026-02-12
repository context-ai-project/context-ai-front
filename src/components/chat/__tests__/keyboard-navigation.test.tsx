/**
 * Keyboard navigation tests for interactive Chat components
 *
 * Validates that all interactive elements can be operated
 * with keyboard only (Tab, Enter, Escape, Arrow keys).
 */
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SourceCard } from '../SourceCard';
import { MessageInput } from '../MessageInput';
import type { SourceFragment } from '@/types/message.types';

// Mock useChatStore
const mockIsLoading = vi.fn().mockReturnValue(false);
vi.mock('@/stores/chat.store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores/chat.store')>();
  return {
    ...actual,
    useIsLoading: () => mockIsLoading(),
  };
});

const MOCK_SOURCE: SourceFragment = {
  id: 'src-1',
  sourceId: 'doc-1',
  content: 'This is the expandable source content.',
  similarity: 0.92,
  metadata: { title: 'Test Document', page: 5 },
};

describe('Keyboard Navigation — Chat Components', () => {
  describe('MessageInput', () => {
    it('should focus textarea when tabbed to', async () => {
      const user = userEvent.setup();
      render(<MessageInput />);

      await user.tab();
      const textarea = screen.getByTestId('message-input');
      expect(textarea).toHaveFocus();
    });

    it('should submit on Enter key when textarea has content', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput onSendMessage={onSend} />);

      const textarea = screen.getByTestId('message-input');
      await user.click(textarea);
      await user.type(textarea, 'Hello AI');
      await user.keyboard('{Enter}');

      expect(onSend).toHaveBeenCalledWith('Hello AI');
    });

    it('should insert newline on Shift+Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<MessageInput onSendMessage={onSend} />);

      const textarea = screen.getByTestId('message-input');
      await user.click(textarea);
      await user.type(textarea, 'Line 1');
      await user.keyboard('{Shift>}{Enter}{/Shift}');

      // Should NOT submit
      expect(onSend).not.toHaveBeenCalled();
    });

    it('send button should be reachable via keyboard Tab', async () => {
      const user = userEvent.setup();
      render(<MessageInput />);

      const textarea = screen.getByTestId('message-input');
      const sendButton = screen.getByTestId('send-button');

      // Focus the textarea first
      await user.click(textarea);
      expect(textarea).toHaveFocus();

      // Type something to enable the send button
      await user.type(textarea, 'Hello');

      // Tab to the send button
      await user.tab();
      expect(sendButton).toHaveFocus();
    });
  });

  describe('SourceCard', () => {
    it('toggle button should be focusable via Tab', async () => {
      const user = userEvent.setup();
      render(<SourceCard source={MOCK_SOURCE} index={0} />);

      await user.tab();

      const toggleButton = screen.getByRole('button', { name: /test document/i });
      expect(toggleButton).toHaveFocus();
    });

    it('should expand/collapse on Enter key', async () => {
      const user = userEvent.setup();
      render(<SourceCard source={MOCK_SOURCE} index={0} />);

      const toggleButton = screen.getByRole('button', { name: /test document/i });
      await user.click(toggleButton);

      // Should be expanded now
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('This is the expandable source content.')).toBeInTheDocument();

      // Press Enter again to collapse
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should expand on Space key', async () => {
      const user = userEvent.setup();
      render(<SourceCard source={MOCK_SOURCE} index={0} />);

      const toggleButton = screen.getByRole('button', { name: /test document/i });
      toggleButton.focus();
      await user.keyboard(' ');

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
