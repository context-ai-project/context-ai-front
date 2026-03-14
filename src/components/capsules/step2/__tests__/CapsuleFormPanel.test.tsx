import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapsuleFormPanel } from '../CapsuleFormPanel';

const mockPreviousStep = vi.fn();
const mockGenerateAudio = vi.fn();

vi.mock('../CapsuleScriptEditor', () => ({
  CapsuleScriptEditor: () => <div data-testid="script-editor" />,
}));

vi.mock('../CapsuleVoiceSelect', () => ({
  CapsuleVoiceSelect: () => <div data-testid="voice-select" />,
}));

vi.mock('@/stores/capsule.store', () => ({
  useIntroText: () => '',
  useSetIntroText: () => vi.fn(),
  useSelectedVoiceId: () => 'voice-1',
  useCapsuleScript: () => 'Some script',
  useIsGeneratingAudio: () => false,
  useIsCreating: () => false,
  usePreviousStep: () => mockPreviousStep,
  useGenerateAudio: () => mockGenerateAudio,
  useSelectedDocumentIds: () => ['doc-1'],
  useCapsuleType: () => 'AUDIO',
}));

describe('CapsuleFormPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders script editor and voice select', () => {
    render(<CapsuleFormPanel />);
    expect(screen.getByTestId('script-editor')).toBeInTheDocument();
    expect(screen.getByTestId('voice-select')).toBeInTheDocument();
  });

  it('renders intro text field', () => {
    render(<CapsuleFormPanel />);
    expect(screen.getByLabelText('introText')).toBeInTheDocument();
  });

  it('renders back and generate buttons', () => {
    render(<CapsuleFormPanel />);
    expect(screen.getByText('previous')).toBeInTheDocument();
    expect(screen.getByText('generateAudio')).toBeInTheDocument();
  });

  it('calls previousStep when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<CapsuleFormPanel />);
    await user.click(screen.getByText('previous'));
    expect(mockPreviousStep).toHaveBeenCalled();
  });

  it('calls custom onBack when provided', async () => {
    const customBack = vi.fn();
    const user = userEvent.setup();
    render(<CapsuleFormPanel onBack={customBack} />);
    await user.click(screen.getByText('previous'));
    expect(customBack).toHaveBeenCalled();
    expect(mockPreviousStep).not.toHaveBeenCalled();
  });

  it('shows selected document IDs', () => {
    render(<CapsuleFormPanel />);
    expect(screen.getByText(/doc-1/)).toBeInTheDocument();
  });
});
