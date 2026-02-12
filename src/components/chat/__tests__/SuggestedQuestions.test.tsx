import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SuggestedQuestions } from '../SuggestedQuestions';
import { SUGGESTED_QUESTIONS } from '@/constants/suggested-questions';
import { vi } from 'vitest';

// Mock the user store to return a specific sector
const mockCurrentSectorId = vi.fn().mockReturnValue(null);

vi.mock('@/stores/user.store', () => ({
  useCurrentSectorId: () => mockCurrentSectorId(),
  UserStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('SuggestedQuestions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSectorId.mockReturnValue(null);
  });

  it('should render "Try asking:" heading', () => {
    render(<SuggestedQuestions />);

    expect(screen.getByText('Try asking:')).toBeInTheDocument();
  });

  it('should render default questions when no sector is selected', () => {
    render(<SuggestedQuestions />);

    for (const question of SUGGESTED_QUESTIONS.default) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it('should render sector-specific questions when sector is selected', () => {
    const hrSectorId = '440e8400-e29b-41d4-a716-446655440000';
    mockCurrentSectorId.mockReturnValue(hrSectorId);

    render(<SuggestedQuestions />);

    for (const question of SUGGESTED_QUESTIONS[hrSectorId]) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it('should render engineering sector questions', () => {
    const engSectorId = '440e8400-e29b-41d4-a716-446655440001';
    mockCurrentSectorId.mockReturnValue(engSectorId);

    render(<SuggestedQuestions />);

    for (const question of SUGGESTED_QUESTIONS[engSectorId]) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it('should fall back to default questions for unknown sector', () => {
    mockCurrentSectorId.mockReturnValue('unknown-sector-id');

    render(<SuggestedQuestions />);

    for (const question of SUGGESTED_QUESTIONS.default) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });

  it('should call onQuestionClick with the question text when clicked', async () => {
    const onQuestionClick = vi.fn();
    render(<SuggestedQuestions onQuestionClick={onQuestionClick} />);

    const firstQuestion = SUGGESTED_QUESTIONS.default[0];
    const button = screen.getByText(firstQuestion);
    await user.click(button);

    expect(onQuestionClick).toHaveBeenCalledWith(firstQuestion);
  });

  it('should render 4 question buttons', () => {
    render(<SuggestedQuestions />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(SUGGESTED_QUESTIONS.default.length);
  });

  it('should not throw when onQuestionClick is not provided', async () => {
    render(<SuggestedQuestions />);

    const firstQuestion = SUGGESTED_QUESTIONS.default[0];
    const button = screen.getByText(firstQuestion);

    // Should not throw when clicked without handler
    await user.click(button);

    // Button should still be in the document after click
    expect(button).toBeInTheDocument();
  });
});
