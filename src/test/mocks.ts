import { MessageRole, type MessageDto, type SourceFragment } from '@/types/message.types';
import { ErrorType } from '@/lib/api/error-handler';

/**
 * Mock source fragments for testing
 */
export const mockSources: SourceFragment[] = [
  {
    id: 'source-1',
    content: 'Employees are entitled to 20 days of paid vacation per year.',
    similarity: 0.95,
    sourceId: 'hr-manual-2024',
    metadata: {
      title: 'HR Manual 2024',
      page: 42,
      url: 'https://intranet.company.com/hr/manual',
    },
  },
  {
    id: 'source-2',
    content: 'The vacation request process is done through the employee portal.',
    similarity: 0.92,
    sourceId: 'hr-procedures',
    metadata: {
      title: 'HR Procedures',
      page: 15,
      url: 'https://intranet.company.com/hr/procedures',
    },
  },
  {
    id: 'source-3',
    content: 'Vacation requests must be submitted at least 15 days in advance.',
    similarity: 0.88,
    sourceId: 'hr-policies',
    metadata: {
      title: 'HR Policies',
      page: 8,
    },
  },
];

/**
 * Mock user message
 */
export const mockUserMessage: MessageDto = {
  id: 'msg-user-1',
  conversationId: 'conv-test-001',
  role: MessageRole.USER,
  content: 'How do I request vacation days?',
  createdAt: '2026-01-15T10:30:00Z',
};

/**
 * Mock assistant message with sources
 */
export const mockAssistantMessage: MessageDto = {
  id: 'msg-assistant-1',
  conversationId: 'conv-test-001',
  role: MessageRole.ASSISTANT,
  content: `To request vacation days, follow these steps:

1. Log into the employee portal
2. Select "Vacation Request"
3. Choose your desired dates
4. Wait for supervisor approval

You have **20 days** of annual vacation.`,
  sourcesUsed: mockSources,
  createdAt: '2026-01-15T10:30:05Z',
};

/**
 * Mock conversation with multiple messages
 */
export const mockConversation: MessageDto[] = [
  mockUserMessage,
  mockAssistantMessage,
  {
    id: 'msg-user-2',
    conversationId: 'conv-test-001',
    role: MessageRole.USER,
    content: 'What about sick days?',
    createdAt: '2026-01-15T10:31:00Z',
  },
  {
    id: 'msg-assistant-2',
    conversationId: 'conv-test-001',
    role: MessageRole.ASSISTANT,
    content: 'Sick days are handled separately from vacation days.',
    sourcesUsed: [mockSources[0]],
    createdAt: '2026-01-15T10:31:05Z',
  },
];

/**
 * Mock error types for testing ErrorState
 */
export const mockErrors = {
  network: {
    type: ErrorType.NETWORK,
    message: 'Unable to connect to the server.',
  },
  auth: {
    type: ErrorType.AUTH,
    message: 'Authentication failed. Please sign in again.',
  },
  server: {
    type: ErrorType.SERVER,
    message: 'Server error. Please try again later.',
  },
  validation: {
    type: ErrorType.VALIDATION,
    message: 'Invalid input. Please check your data.',
  },
  timeout: {
    type: ErrorType.TIMEOUT,
    message: 'Request timed out. Please try again.',
  },
  unknown: {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred.',
  },
};
