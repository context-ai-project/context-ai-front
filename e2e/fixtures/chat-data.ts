/**
 * Test data fixtures for E2E chat tests
 */

/**
 * Test message templates for various scenarios
 */
export interface TestMessages {
  simple: string;
  complex: string;
  withMarkdown: string;
  longMessage: string;
  empty: string;
  specialChars: string;
}

export const testMessages: TestMessages = {
  simple: '¿Cómo pido vacaciones?',
  complex: '¿Cuál es el proceso completo para solicitar vacaciones y cuántos días tengo disponibles?',
  withMarkdown: '¿Puedes darme una lista de los beneficios de la empresa?',
  longMessage: 'Esta es una pregunta muy larga '.repeat(20),
  empty: '',
  specialChars: '¿Qué pasa con los caracteres especiales? #$%&*()[]{}',
};

/**
 * Source fragment metadata for test responses
 */
export interface SourceMetadata {
  title: string;
  page: number;
  url: string;
}

/**
 * Source fragment structure
 */
export interface SourceFragment {
  id: string;
  content: string;
  similarity: number;
  sourceId: string;
  metadata: SourceMetadata;
}

/**
 * Mock response structure matching ChatResponseDto from the backend
 * This is the format that chatApi.sendMessage() returns
 */
export interface MockChatResponse {
  response: string;
  conversationId: string;
  sources: SourceFragment[];
  timestamp: string;
}

/**
 * Pre-built mock response data
 */
export const mockSources: SourceFragment[] = [
  {
    id: '1',
    content: 'Los empleados tienen derecho a 20 días de vacaciones pagadas por año...',
    similarity: 0.95,
    sourceId: 'hr-manual-2024',
    metadata: {
      title: 'Manual de RRHH 2024',
      page: 42,
      url: 'https://intranet.company.com/hr/manual',
    },
  },
  {
    id: '2',
    content: 'El proceso de solicitud de vacaciones se realiza a través del portal...',
    similarity: 0.92,
    sourceId: 'hr-procedures',
    metadata: {
      title: 'Procedimientos RRHH',
      page: 15,
      url: 'https://intranet.company.com/hr/procedures',
    },
  },
];

export const mockAssistantContent = `Para solicitar vacaciones debes:

1. Ingresar a nuestro portal de RRHH
2. Seleccionar "Solicitud de vacaciones"
3. Elegir las fechas deseadas
4. Esperar aprobación de tu supervisor

Tienes **20 días** de vacaciones anuales.`;

/**
 * Mock ChatResponseDto for the vacation policy query
 * This matches the exact format returned by the backend API
 */
/** Fixed timestamp to prevent visual-regression snapshot churn */
const FIXED_TIMESTAMP = '2026-01-15T12:00:00.000Z';

export const mockChatResponses: Record<string, MockChatResponse> = {
  vacationPolicy: {
    response: mockAssistantContent,
    conversationId: 'conv-e2e-001',
    sources: mockSources,
    timestamp: FIXED_TIMESTAMP,
  },
  vacationPolicyNoSources: {
    response: mockAssistantContent,
    conversationId: 'conv-e2e-001',
    sources: [],
    timestamp: FIXED_TIMESTAMP,
  },
};

/**
 * Test user structure
 */
export interface TestUser {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export const testUser: TestUser = {
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://example.com/avatar.jpg',
  sub: 'auth0|test123',
};

/**
 * Test sector structure
 */
export interface TestSector {
  id: string;
  name: string;
}

export const testSectors: TestSector[] = [
  {
    id: '440e8400-e29b-41d4-a716-446655440000',
    name: 'Human Resources',
  },
  {
    id: '440e8400-e29b-41d4-a716-446655440001',
    name: 'Engineering',
  },
];

/**
 * Test conversation structure
 */
export interface TestConversation {
  id: string;
  userId: string;
  sectorId: string;
  createdAt: string;
  updatedAt: string;
}

export const testConversation: TestConversation = {
  id: '660e8400-e29b-41d4-a716-446655440101',
  userId: 'auth0|test123',
  sectorId: '440e8400-e29b-41d4-a716-446655440000',
  createdAt: FIXED_TIMESTAMP,
  updatedAt: FIXED_TIMESTAMP,
};

/**
 * UI element selectors for testing
 */
export interface UIElements {
  messageInput: string;
  sendButton: string;
  clearButton: string;
  messageList: string;
  userMessage: string;
  assistantMessage: string;
  typingIndicator: string;
  sourceCard: string;
  errorState: string;
  emptyState: string;
  markdownContent: string;
}

export const expectedUIElements: UIElements = {
  messageInput: '[data-testid="message-input"]',
  sendButton: '[data-testid="send-button"]',
  clearButton: '[data-testid="clear-button"]',
  messageList: '[data-testid="message-list"]',
  userMessage: '[data-testid="user-message"]',
  assistantMessage: '[data-testid="assistant-message"]',
  typingIndicator: '[data-testid="typing-indicator"]',
  sourceCard: '[data-testid="source-card"]',
  errorState: '[data-testid="error-state"]',
  emptyState: '[data-testid="empty-state"]',
  markdownContent: '[data-testid="markdown-content"]',
};
