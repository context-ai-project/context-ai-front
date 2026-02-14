import { render, screen } from '@/test/test-utils';
import { MessageList } from '../MessageList';
import { mockUserMessage, mockAssistantMessage, mockConversation } from '@/test/mocks';

describe('MessageList', () => {
  it('should render message list with test id', () => {
    render(<MessageList messages={[]} isLoading={false} />);

    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  it('should render user message correctly', () => {
    render(<MessageList messages={[mockUserMessage]} isLoading={false} />);

    expect(screen.getByTestId('user-message')).toBeInTheDocument();
    expect(screen.getByText(mockUserMessage.content)).toBeInTheDocument();
  });

  it('should render assistant message correctly', () => {
    render(<MessageList messages={[mockAssistantMessage]} isLoading={false} />);

    expect(screen.getByTestId('assistant-message')).toBeInTheDocument();
  });

  it('should render multiple messages', () => {
    render(<MessageList messages={mockConversation} isLoading={false} />);

    const userMessages = screen.getAllByTestId('user-message');
    const assistantMessages = screen.getAllByTestId('assistant-message');

    expect(userMessages).toHaveLength(2);
    expect(assistantMessages).toHaveLength(2);
  });

  it('should display typing indicator when loading', () => {
    render(<MessageList messages={[]} isLoading={true} />);

    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('should not display typing indicator when not loading', () => {
    render(<MessageList messages={[]} isLoading={false} />);

    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it('should render sources for assistant messages', () => {
    render(<MessageList messages={[mockAssistantMessage]} isLoading={false} />);

    const sourceCards = screen.getAllByTestId('source-card');
    expect(sourceCards.length).toBeGreaterThan(0);
  });

  it('should display timestamp for each message', () => {
    render(<MessageList messages={[mockUserMessage]} isLoading={false} />);

    // Format: "MMM dd, HH:mm" from date-fns
    expect(screen.getByText(/Jan 15, \d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('should display user avatar with "Y" initial for user messages', () => {
    render(<MessageList messages={[mockUserMessage]} isLoading={false} />);

    expect(screen.getByText('Y')).toBeInTheDocument(); // "You" -> "Y"
  });

  it('should display assistant avatar with "A" initial for assistant messages', () => {
    render(<MessageList messages={[mockAssistantMessage]} isLoading={false} />);

    expect(screen.getByText('A')).toBeInTheDocument(); // "Assistant" -> "A"
  });

  it('should filter out invalid messages (missing id, role, or content)', () => {
    const invalidMessages = [
      mockUserMessage,
      { id: '', conversationId: 'conv-1', role: '', content: '', createdAt: '' },
    ];

    // The filter checks for truthy id, role, and content
    render(
      <MessageList
        messages={invalidMessages as Parameters<typeof MessageList>[0]['messages']}
        isLoading={false}
      />,
    );

    // Only the valid message should render
    const userMessages = screen.getAllByTestId('user-message');
    expect(userMessages).toHaveLength(1);
  });

  it('should call scrollIntoView for auto-scrolling', () => {
    render(<MessageList messages={mockConversation} isLoading={false} />);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it('should render markdown content for assistant messages', () => {
    render(<MessageList messages={[mockAssistantMessage]} isLoading={false} />);

    // The assistant message contains markdown (bold text with **)
    // MarkdownRenderer should be used for assistant messages
    const assistantMessage = screen.getByTestId('assistant-message');
    expect(assistantMessage.querySelector('[data-testid="markdown-content"]')).toBeInTheDocument();
  });
});
