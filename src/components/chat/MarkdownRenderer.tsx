'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

/**
 * Custom markdown components extracted outside the render function
 * to avoid re-creation on every render
 */
const MARKDOWN_COMPONENTS: Components = {
  // Custom heading components
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold text-gray-900" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold text-gray-900" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold text-gray-900" {...props}>
      {children}
    </h3>
  ),

  // Custom paragraph component
  p: ({ children, ...props }) => (
    <p className="my-2 leading-relaxed text-gray-800" {...props}>
      {children}
    </p>
  ),

  // Custom list components
  ul: ({ children, ...props }) => (
    <ul className="my-2 list-disc space-y-1 pl-6 text-gray-800" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 list-decimal space-y-1 pl-6 text-gray-800" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-800" {...props}>
      {children}
    </li>
  ),

  // Custom link component with security
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline hover:text-blue-800"
      {...props}
    >
      {children}
    </a>
  ),

  // Custom code block component with syntax highlighting
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (language) {
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="my-4 rounded-lg"
          showLineNumbers
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    return (
      <code
        className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Custom blockquote component
  blockquote: ({ children, ...props }) => (
    <blockquote className="my-4 border-l-4 border-gray-300 pl-4 text-gray-700 italic" {...props}>
      {children}
    </blockquote>
  ),

  // Custom table components
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-gray-200 bg-white" {...props}>
      {children}
    </tbody>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2 text-sm whitespace-nowrap text-gray-800" {...props}>
      {children}
    </td>
  ),

  // Custom horizontal rule
  hr: (props) => <hr className="my-4 border-gray-300" {...props} />,

  // Custom strong/emphasis
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="text-gray-800 italic" {...props}>
      {children}
    </em>
  ),
};

/**
 * MarkdownRenderer component renders markdown content with syntax highlighting
 * for code blocks, safe link handling, and custom styling.
 *
 * @example
 * ```tsx
 * <MarkdownRenderer content={message.content} />
 * ```
 */
interface MarkdownRendererProps {
  content: string;
  className?: string;
  'data-testid'?: string;
}

export function MarkdownRenderer({
  content,
  className,
  'data-testid': dataTestId,
}: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm max-w-none', className)} data-testid={dataTestId}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
