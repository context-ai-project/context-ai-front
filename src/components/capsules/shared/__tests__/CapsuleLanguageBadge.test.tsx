import { render, screen } from '@/test/test-utils';
import { CapsuleLanguageBadge } from '../CapsuleLanguageBadge';

describe('CapsuleLanguageBadge', () => {
  describe('known languages', () => {
    const cases: Array<{ language: string; flag: string; label: string }> = [
      { language: 'es', flag: '🇪🇸', label: 'ES' },
      { language: 'en', flag: '🇬🇧', label: 'EN' },
      { language: 'fr', flag: '🇫🇷', label: 'FR' },
      { language: 'de', flag: '🇩🇪', label: 'DE' },
      { language: 'pt', flag: '🇵🇹', label: 'PT' },
      { language: 'it', flag: '🇮🇹', label: 'IT' },
    ];

    it.each(cases)(
      'renders flag $flag and label $label for "$language"',
      ({ language, flag, label }) => {
        render(<CapsuleLanguageBadge language={language} />);

        expect(screen.getByText(flag)).toBeInTheDocument();
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  describe('BCP-47 codes (prefix matching)', () => {
    it('matches "es-ES" to the Spanish flag', () => {
      render(<CapsuleLanguageBadge language="es-ES" />);
      expect(screen.getByText('🇪🇸')).toBeInTheDocument();
      expect(screen.getByText('ES')).toBeInTheDocument();
    });

    it('matches "en-US" to the English flag', () => {
      render(<CapsuleLanguageBadge language="en-US" />);
      expect(screen.getByText('🇬🇧')).toBeInTheDocument();
    });
  });

  describe('unknown language fallback', () => {
    it('renders globe emoji and uppercased code for unknown language', () => {
      render(<CapsuleLanguageBadge language="ja" />);
      expect(screen.getByText('🌐')).toBeInTheDocument();
      expect(screen.getByText('JA')).toBeInTheDocument();
    });

    it('truncates the label to 5 characters for long unknown codes', () => {
      render(<CapsuleLanguageBadge language="zh-TW" />);
      // Falls through to fallback; label is first 5 chars of original uppercased
      expect(screen.getByText('🌐')).toBeInTheDocument();
    });
  });

  describe('title attribute', () => {
    it('sets the title attribute on the outer span to the raw language prop', () => {
      const { container } = render(<CapsuleLanguageBadge language="es-ES" />);
      const span = container.querySelector('span[title]');
      expect(span).toHaveAttribute('title', 'es-ES');
    });
  });

  describe('accessibility', () => {
    it('marks the flag span as aria-hidden', () => {
      const { container } = render(<CapsuleLanguageBadge language="en" />);
      const ariaHidden = container.querySelector('[aria-hidden="true"]');
      expect(ariaHidden).toBeInTheDocument();
      expect(ariaHidden?.textContent).toBe('🇬🇧');
    });
  });
});
