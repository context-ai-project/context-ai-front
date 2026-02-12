import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { LanguageSelector } from '../LanguageSelector';
import { useLocale, useTranslations } from 'next-intl';

// Mock the i18n locales
vi.mock('@/i18n', () => ({
  locales: ['en', 'es'],
}));

// Override the next-intl mocks for this test file specifically
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

// Mock Select components
vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
    disabled,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (val: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      {children}
      {/* Simulate value change via test utility */}
      <button data-testid="select-trigger-change" onClick={() => onValueChange?.('es')}>
        Change to ES
      </button>
      <button data-testid="select-same-locale" onClick={() => onValueChange?.('en')}>
        Keep EN
      </button>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

describe('LanguageSelector', () => {
  const mockTranslate = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      select: 'Select Language',
      en: 'English',
      es: 'Spanish',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslations as Mock).mockReturnValue(mockTranslate);
    (useLocale as Mock).mockReturnValue('en');

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        pathname: '/en/chat',
        href: '',
      },
    });
  });

  it('should render the language selector', () => {
    render(<LanguageSelector />);

    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'en');
  });

  it('should render all available locale options', () => {
    render(<LanguageSelector />);

    expect(screen.getByTestId('select-item-en')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-es')).toBeInTheDocument();
    expect(screen.getByTestId('select-item-en')).toHaveTextContent('English');
    expect(screen.getByTestId('select-item-es')).toHaveTextContent('Spanish');
  });

  it('should navigate when a different locale is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const changeButton = screen.getByTestId('select-trigger-change');
    await user.click(changeButton);

    // Should redirect to /es/chat
    expect(window.location.href).toBe('/es/chat');
  });

  it('should not navigate when the same locale is selected', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    const sameLocaleButton = screen.getByTestId('select-same-locale');
    await user.click(sameLocaleButton);

    // href should remain empty (not set)
    expect(window.location.href).toBe('');
  });

  it('should render the select trigger', () => {
    render(<LanguageSelector />);

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger).toBeInTheDocument();
  });
});
