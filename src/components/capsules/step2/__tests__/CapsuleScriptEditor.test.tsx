import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapsuleScriptEditor } from '../CapsuleScriptEditor';

const mockSetScript = vi.fn();
const mockGenerateScript = vi.fn();

vi.mock('@/stores/capsule.store', () => ({
  useCapsuleScript: () => 'Hello world script',
  useSetScript: () => mockSetScript,
  useIsGeneratingScript: () => false,
  useGenerateScript: () => mockGenerateScript,
}));

describe('CapsuleScriptEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders script label', () => {
    render(<CapsuleScriptEditor />);
    expect(screen.getByLabelText('script')).toBeInTheDocument();
  });

  it('displays current script value', () => {
    render(<CapsuleScriptEditor />);
    expect(screen.getByDisplayValue('Hello world script')).toBeInTheDocument();
  });

  it('renders generate button', () => {
    render(<CapsuleScriptEditor />);
    expect(screen.getByText('generateScript')).toBeInTheDocument();
  });

  it('calls generateScript on button click', async () => {
    const user = userEvent.setup();
    render(<CapsuleScriptEditor />);
    await user.click(screen.getByText('generateScript'));
    expect(mockGenerateScript).toHaveBeenCalledWith('en');
  });

  it('shows word count', () => {
    render(<CapsuleScriptEditor />);
    expect(screen.getByText(/words/)).toBeInTheDocument();
  });
});
