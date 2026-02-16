import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SuggestedQuestions } from '../SuggestedQuestions';
import { SUGGESTED_QUESTION_KEYS } from '@/constants/suggested-questions';
import { vi } from 'vitest';

// Mock the user store to return a specific sector
const mockCurrentSectorId = vi.fn().mockReturnValue(null);
const mockSectors = vi.fn().mockReturnValue([]);

vi.mock('@/stores/user.store', () => ({
  useCurrentSectorId: () => mockCurrentSectorId(),
  useSectors: () => mockSectors(),
  UserStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

/** Mock sectors matching the SUGGESTED_QUESTION_KEYS sector names */
const MOCK_SECTORS = [
  { id: 'sector-hr-id', name: 'Human Resources' },
  { id: 'sector-eng-id', name: 'Engineering' },
  { id: 'sector-sales-id', name: 'Sales' },
];

describe('SuggestedQuestions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSectorId.mockReturnValue(null);
    mockSectors.mockReturnValue(MOCK_SECTORS);
  });

  it('should render "Try asking:" heading', () => {
    render(<SuggestedQuestions />);

    expect(screen.getByText('tryAsking')).toBeInTheDocument();
  });

  it('should render default question keys when no sector is selected', () => {
    render(<SuggestedQuestions />);

    for (const key of SUGGESTED_QUESTION_KEYS.default) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it('should render sector-specific question keys when HR sector is selected', () => {
    mockCurrentSectorId.mockReturnValue('sector-hr-id');

    render(<SuggestedQuestions />);

    const hrKeys = SUGGESTED_QUESTION_KEYS['human resources'];
    for (const key of hrKeys) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it('should render engineering sector question keys', () => {
    mockCurrentSectorId.mockReturnValue('sector-eng-id');

    render(<SuggestedQuestions />);

    const engKeys = SUGGESTED_QUESTION_KEYS.engineering;
    for (const key of engKeys) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it('should fall back to default question keys for unknown sector', () => {
    mockCurrentSectorId.mockReturnValue('unknown-sector-id');

    render(<SuggestedQuestions />);

    for (const key of SUGGESTED_QUESTION_KEYS.default) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it('should fall back to default when sector name has no questions', () => {
    mockSectors.mockReturnValue([
      ...MOCK_SECTORS,
      { id: 'sector-marketing-id', name: 'Marketing' },
    ]);
    mockCurrentSectorId.mockReturnValue('sector-marketing-id');

    render(<SuggestedQuestions />);

    for (const key of SUGGESTED_QUESTION_KEYS.default) {
      expect(screen.getByText(key)).toBeInTheDocument();
    }
  });

  it('should call onQuestionClick with the translated question text when clicked', async () => {
    const onQuestionClick = vi.fn();
    render(<SuggestedQuestions onQuestionClick={onQuestionClick} />);

    const firstKey = SUGGESTED_QUESTION_KEYS.default[0];
    const button = screen.getByText(firstKey);
    await user.click(button);

    expect(onQuestionClick).toHaveBeenCalledWith(firstKey);
  });

  it('should render 4 question buttons', () => {
    render(<SuggestedQuestions />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(SUGGESTED_QUESTION_KEYS.default.length);
  });

  it('should not throw when onQuestionClick is not provided', async () => {
    render(<SuggestedQuestions />);

    const firstKey = SUGGESTED_QUESTION_KEYS.default[0];
    const button = screen.getByText(firstKey);

    // Should not throw when clicked without handler
    await user.click(button);

    // Button should still be in the document after click
    expect(button).toBeInTheDocument();
  });
});
