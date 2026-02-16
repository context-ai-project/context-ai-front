import { render, screen, waitFor, fireEvent } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../MessageInput';
import { vi } from 'vitest';

// Mock the chat store hooks
const mockIsLoading = vi.fn().mockReturnValue(false);
const mockClearMessages = vi.fn();

vi.mock('@/stores/chat.store', () => ({
  useIsLoading: () => mockIsLoading(),
  useClearMessages: () => mockClearMessages,
  ChatStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const TESTID_INPUT = 'message-input';
const TESTID_SEND = 'send-button';
const TESTID_CLEAR = 'clear-button';
const TEST_MESSAGE = 'Test message';
const SEND_LABEL = 'Send message';
// next-intl mock returns the key, so t('clear') returns 'clear'
const CLEAR_LABEL = 'clear';

describe('MessageInput', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
  });

  it('should render textarea with test id', () => {
    render(<MessageInput />);

    expect(screen.getByTestId(TESTID_INPUT)).toBeInTheDocument();
  });

  it('should render send button with test id', () => {
    render(<MessageInput />);

    expect(screen.getByTestId(TESTID_SEND)).toBeInTheDocument();
  });

  it('should have accessible aria-label on textarea', () => {
    render(<MessageInput />);

    expect(screen.getByLabelText('Message input')).toBeInTheDocument();
  });

  it('should have accessible aria-label on send button', () => {
    render(<MessageInput />);

    expect(screen.getByLabelText(SEND_LABEL)).toBeInTheDocument();
  });

  it('should disable send button when input is empty', () => {
    render(<MessageInput />);

    const sendButton = screen.getByTestId(TESTID_SEND);
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has text', async () => {
    render(<MessageInput />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, 'Hello');

    const sendButton = screen.getByTestId(TESTID_SEND);
    expect(sendButton).not.toBeDisabled();
  });

  it('should call onSendMessage when form is submitted', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, TEST_MESSAGE);
    await user.click(screen.getByTestId(TESTID_SEND));

    expect(onSendMessage).toHaveBeenCalledWith(TEST_MESSAGE);
  });

  it('should clear input after sending message', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, TEST_MESSAGE);
    await user.click(screen.getByTestId(TESTID_SEND));

    expect(input).toHaveValue('');
  });

  it('should send message on Enter key press', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, `${TEST_MESSAGE}{Enter}`);

    expect(onSendMessage).toHaveBeenCalledWith(TEST_MESSAGE);
  });

  it('should not send on Shift+Enter (new line)', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}');

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('should disable input when loading', () => {
    mockIsLoading.mockReturnValue(true);
    render(<MessageInput />);

    const input = screen.getByTestId(TESTID_INPUT);
    expect(input).toBeDisabled();
  });

  it('should show loading placeholder when loading', () => {
    mockIsLoading.mockReturnValue(true);
    render(<MessageInput />);

    const input = screen.getByTestId(TESTID_INPUT);
    expect(input).toHaveAttribute('placeholder', 'placeholderLoading');
  });

  it('should show character count when focused and has text', async () => {
    render(<MessageInput />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.click(input);
    await user.type(input, 'Hello');

    await waitFor(() => {
      expect(screen.getByText(/5 \/ 2000/)).toBeInTheDocument();
    });
  });

  it('should show error when message exceeds max length', () => {
    render(<MessageInput />);

    const input = screen.getByTestId(TESTID_INPUT);
    fireEvent.change(input, { target: { value: 'a'.repeat(2001) } });

    expect(screen.getByText('input.characterLimit')).toBeInTheDocument();
  });

  it('should render clear button when onClearConversation is provided', () => {
    render(<MessageInput onClearConversation={vi.fn()} />);

    expect(screen.getByTestId(TESTID_CLEAR)).toBeInTheDocument();
  });

  it('should not render clear button when onClearConversation is not provided', () => {
    render(<MessageInput />);

    expect(screen.queryByTestId(TESTID_CLEAR)).not.toBeInTheDocument();
  });

  it('should clear button have accessible aria-label', () => {
    render(<MessageInput onClearConversation={vi.fn()} />);

    expect(screen.getByLabelText(CLEAR_LABEL)).toBeInTheDocument();
  });

  it('should open confirmation dialog when clear button is clicked', async () => {
    render(<MessageInput onClearConversation={vi.fn()} />);

    await user.click(screen.getByTestId(TESTID_CLEAR));

    // AlertDialog should show (next-intl mock returns the key as text)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('clearDialog.title')).toBeInTheDocument();
    expect(screen.getByText('clearDialog.description')).toBeInTheDocument();
  });

  it('should call onClearConversation when clear is confirmed in dialog', async () => {
    const onClear = vi.fn();
    render(<MessageInput onClearConversation={onClear} />);

    await user.click(screen.getByTestId(TESTID_CLEAR));

    // Click the confirm button in the AlertDialog (text is the translation key)
    const confirmButton = screen.getByRole('button', { name: /clearDialog\.confirm/i });
    await user.click(confirmButton);

    expect(mockClearMessages).toHaveBeenCalled();
    expect(onClear).toHaveBeenCalled();
  });

  it('should not clear conversation when cancel is clicked in dialog', async () => {
    const onClear = vi.fn();
    render(<MessageInput onClearConversation={onClear} />);

    await user.click(screen.getByTestId(TESTID_CLEAR));

    // Click the cancel button in the AlertDialog (text is the translation key)
    const cancelButton = screen.getByRole('button', { name: /clearDialog\.cancel/i });
    await user.click(cancelButton);

    expect(mockClearMessages).not.toHaveBeenCalled();
    expect(onClear).not.toHaveBeenCalled();
  });

  it('should not send whitespace-only messages', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, '   ');

    const sendButton = screen.getByTestId(TESTID_SEND);
    expect(sendButton).toBeDisabled();
  });

  it('should trim message before sending', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId(TESTID_INPUT);
    await user.type(input, `  ${TEST_MESSAGE}  `);
    await user.click(screen.getByTestId(TESTID_SEND));

    expect(onSendMessage).toHaveBeenCalledWith(TEST_MESSAGE);
  });

  it('should mark textarea as aria-invalid when over limit', () => {
    render(<MessageInput />);

    const input = screen.getByTestId(TESTID_INPUT);
    fireEvent.change(input, { target: { value: 'a'.repeat(2001) } });

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
