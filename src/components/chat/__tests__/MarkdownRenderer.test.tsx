import { render, screen } from '@/test/test-utils';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

// Mock react-syntax-highlighter to avoid ESM import issues in test environment
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

describe('MarkdownRenderer', () => {
  it('should render plain text', () => {
    render(<MarkdownRenderer content="Hello, world!" />);

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('should render bold text', () => {
    render(<MarkdownRenderer content="This is **bold** text" />);

    const boldText = screen.getByText('bold');
    expect(boldText.tagName).toBe('STRONG');
  });

  it('should render italic text', () => {
    render(<MarkdownRenderer content="This is *italic* text" />);

    const italicText = screen.getByText('italic');
    expect(italicText.tagName).toBe('EM');
  });

  it('should render headings', () => {
    render(<MarkdownRenderer content="# Heading 1" />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Heading 1');
  });

  it('should render h2 headings', () => {
    render(<MarkdownRenderer content="## Heading 2" />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Heading 2');
  });

  it('should render h3 headings', () => {
    render(<MarkdownRenderer content="### Heading 3" />);

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Heading 3');
  });

  it('should render unordered lists', () => {
    const content = ['- Item 1', '- Item 2', '- Item 3'].join('\n');

    render(<MarkdownRenderer content={content} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('should render ordered lists', () => {
    const content = ['1. First', '2. Second', '3. Third'].join('\n');

    render(<MarkdownRenderer content={content} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  it('should render links with security attributes', () => {
    render(<MarkdownRenderer content="Visit [Google](https://google.com)" />);

    const link = screen.getByRole('link', { name: 'Google' });
    expect(link).toHaveAttribute('href', 'https://google.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render inline code', () => {
    render(<MarkdownRenderer content="Use `console.log()` for debugging" />);

    const code = screen.getByText('console.log()');
    expect(code.tagName).toBe('CODE');
  });

  it('should render code blocks with syntax highlighting', () => {
    const content = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={content} />);

    const highlighter = screen.getByTestId('syntax-highlighter');
    expect(highlighter).toBeInTheDocument();
    expect(highlighter).toHaveAttribute('data-language', 'javascript');
  });

  it('should render blockquotes', () => {
    const { container } = render(<MarkdownRenderer content="> This is a quote" />);

    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent('This is a quote');
  });

  it('should render tables', () => {
    const tableContent = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`;

    render(<MarkdownRenderer content={tableContent} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should render horizontal rules', () => {
    const content = ['Above', '', '---', '', 'Below'].join('\n');
    const { container } = render(<MarkdownRenderer content={content} />);

    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<MarkdownRenderer content="Test" className="custom-class" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should apply data-testid', () => {
    render(<MarkdownRenderer content="Test" data-testid="my-markdown" />);

    expect(screen.getByTestId('my-markdown')).toBeInTheDocument();
  });

  it('should render complex markdown content', () => {
    const complexContent = `# Title

This is a paragraph with **bold** and *italic* text.

## Section

- List item 1
- List item 2

> A blockquote

Visit [link](https://example.com)`;

    const { container } = render(<MarkdownRenderer content={complexContent} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Title');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Section');
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
    expect(container.querySelector('blockquote')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'link' })).toBeInTheDocument();
  });
});
