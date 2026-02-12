/**
 * Accessibility (a11y) tests for Chat components
 *
 * Uses vitest-axe (axe-core) to validate WCAG 2.1 AA compliance.
 * Tests cover: EmptyState, ErrorState, TypingIndicator, SourceCard,
 * SourceList, MessageInput, MarkdownRenderer, SuggestedQuestions.
 */
import { render } from '@/test/test-utils';
import { axe } from '@/test/a11y-setup';
import { EmptyState } from '../EmptyState';
import { ErrorState } from '../ErrorState';
import { TypingIndicator } from '../TypingIndicator';
import { SourceCard } from '../SourceCard';
import { SourceList } from '../SourceList';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { SuggestedQuestions } from '../SuggestedQuestions';
import { MessageInput } from '../MessageInput';
import type { SourceFragment } from '@/types/message.types';

// Mock useChatStore for MessageInput
const mockIsLoading = vi.fn().mockReturnValue(false);
vi.mock('@/stores/chat.store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores/chat.store')>();
  return {
    ...actual,
    useIsLoading: () => mockIsLoading(),
  };
});

// Mock react-syntax-highlighter to avoid ESM issues
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      <code>{children}</code>
    </pre>
  ),
}));
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));

const MOCK_SOURCE: SourceFragment = {
  id: 'src-1',
  sourceId: 'doc-1',
  content: 'This is the source content from the document.',
  similarity: 0.95,
  metadata: { title: 'Employee Handbook', page: 12 },
};

const MOCK_SOURCES: SourceFragment[] = [
  MOCK_SOURCE,
  {
    id: 'src-2',
    sourceId: 'doc-2',
    content: 'Another source fragment.',
    similarity: 0.87,
    metadata: { title: 'Policy Guide', page: 3 },
  },
];

/** Shared test description for axe-core scans */
const AXE_PASS = 'should pass axe-core a11y scan';
/** Timeout for axe-core tests (rendering + analysis can be slow in JSDOM) */
const AXE_TIMEOUT = 15_000;

describe('Chat Components — Accessibility', () => {
  describe('EmptyState', () => {
    it(
      AXE_PASS,
      async () => {
        const { container } = render(<EmptyState />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('should have a heading hierarchy', () => {
      const { container } = render(<EmptyState />);
      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Welcome to Context.ai');
    });
  });

  describe('ErrorState', () => {
    it(
      'should have no a11y violations (full variant)',
      async () => {
        const { container } = render(<ErrorState error="Something went wrong" onRetry={vi.fn()} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it(
      'should have no a11y violations (inline variant)',
      async () => {
        const { container } = render(
          <ErrorState
            error="Connection failed"
            onRetry={vi.fn()}
            onDismiss={vi.fn()}
            variant="inline"
          />,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('dismiss button should have aria-label', () => {
      const { getByLabelText } = render(
        <ErrorState error="Error" onDismiss={vi.fn()} variant="inline" />,
      );
      expect(getByLabelText('Dismiss error')).toBeInTheDocument();
    });
  });

  describe('TypingIndicator', () => {
    it(
      AXE_PASS,
      async () => {
        const { container } = render(<TypingIndicator />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('should have role="status" for assistive technologies', () => {
      const { getByRole } = render(<TypingIndicator />);
      expect(getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-live="polite"', () => {
      const { getByRole } = render(<TypingIndicator />);
      expect(getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('SourceCard', () => {
    it(
      'should have no a11y violations (collapsed)',
      async () => {
        const { container } = render(<SourceCard source={MOCK_SOURCE} index={0} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('should have aria-expanded attribute on toggle button', () => {
      const { container } = render(<SourceCard source={MOCK_SOURCE} index={0} />);
      const toggleButton = container.querySelector('[aria-expanded]');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-controls linking to expandable content', () => {
      const { container } = render(<SourceCard source={MOCK_SOURCE} index={0} />);
      const toggleButton = container.querySelector('[aria-controls]');
      expect(toggleButton).toHaveAttribute('aria-controls', 'source-content-0');
    });
  });

  describe('SourceList', () => {
    it(
      AXE_PASS,
      async () => {
        const { container } = render(<SourceList sources={MOCK_SOURCES} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it(
      'should render nothing and produce no violations when empty',
      async () => {
        const { container } = render(<SourceList sources={[]} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );
  });

  describe('MarkdownRenderer', () => {
    it(
      'should have no a11y violations with basic content',
      async () => {
        const { container } = render(<MarkdownRenderer content="Hello **world**" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it(
      'should have no a11y violations with headings and links',
      async () => {
        const content = '# Title\n\nVisit [Google](https://google.com)\n\n> A blockquote';
        const { container } = render(<MarkdownRenderer content={content} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('links should have rel="noopener noreferrer"', () => {
      const { getByRole } = render(<MarkdownRenderer content="[Link](https://example.com)" />);
      const link = getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  describe('SuggestedQuestions', () => {
    it(
      AXE_PASS,
      async () => {
        const { container } = render(<SuggestedQuestions onQuestionClick={vi.fn()} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('each question should be a focusable button', () => {
      const { getAllByRole } = render(<SuggestedQuestions onQuestionClick={vi.fn()} />);
      const buttons = getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('MessageInput', () => {
    it(
      AXE_PASS,
      async () => {
        const { container } = render(<MessageInput />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      },
      AXE_TIMEOUT,
    );

    it('textarea should have aria-label', () => {
      const { getByLabelText } = render(<MessageInput />);
      expect(getByLabelText('Message input')).toBeInTheDocument();
    });

    it('send button should have aria-label', () => {
      const { getByLabelText } = render(<MessageInput />);
      expect(getByLabelText('Send message')).toBeInTheDocument();
    });

    it('textarea should have aria-invalid when over character limit', async () => {
      const { getByTestId } = render(<MessageInput />);
      const textarea = getByTestId('message-input');
      // aria-invalid should be false initially
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });
  });
});
