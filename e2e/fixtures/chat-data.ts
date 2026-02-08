/**
 * Test data fixtures for E2E chat tests
 */

export const testMessages = {
  simple: '¿Cómo pido vacaciones?',
  complex: '¿Cuál es el proceso completo para solicitar vacaciones y cuántos días tengo disponibles?',
  withMarkdown: '¿Puedes darme una lista de los beneficios de la empresa?',
  longMessage: 'Esta es una pregunta muy larga '.repeat(20),
  empty: '',
  specialChars: '¿Qué pasa con los caracteres especiales? #$%&*()[]{}',
};

export const mockResponses = {
  vacationPolicy: {
    content: `Para solicitar vacaciones debes:

1. Ingresar a nuestro portal de RRHH
2. Seleccionar "Solicitud de vacaciones"
3. Elegir las fechas deseadas
4. Esperar aprobación de tu supervisor

Tienes **20 días** de vacaciones anuales.`,
    sources: [
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
    ],
  },
};

export const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  picture: 'https://example.com/avatar.jpg',
  sub: 'auth0|test123',
};

export const testSectors = [
  {
    id: '440e8400-e29b-41d4-a716-446655440000',
    name: 'Human Resources',
  },
  {
    id: '440e8400-e29b-41d4-a716-446655440001',
    name: 'Engineering',
  },
];

export const testConversation = {
  id: '660e8400-e29b-41d4-a716-446655440101',
  userId: 'auth0|test123',
  sectorId: '440e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const expectedUIElements = {
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

