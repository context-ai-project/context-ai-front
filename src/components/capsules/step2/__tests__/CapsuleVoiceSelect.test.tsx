import { render, screen } from '@testing-library/react';
import { CapsuleVoiceSelect } from '../CapsuleVoiceSelect';

const mockLoadVoices = vi.fn();

vi.mock('@/stores/capsule.store', () => ({
  useCapsuleVoices: () => [
    { id: 'v1', name: 'Alloy', category: 'neural' },
    { id: 'v2', name: 'Echo', category: null },
  ],
  useSelectedVoiceId: () => null,
  useSetSelectedVoiceId: () => vi.fn(),
  useIsLoadingVoices: () => false,
  useLoadVoices: () => mockLoadVoices,
}));

describe('CapsuleVoiceSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders voice label', () => {
    render(<CapsuleVoiceSelect />);
    const labels = screen.getAllByText('selectVoice');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders without crashing', () => {
    const { container } = render(<CapsuleVoiceSelect />);
    expect(container.firstChild).toBeTruthy();
  });

  it('does not call loadVoices if voices are already loaded', () => {
    render(<CapsuleVoiceSelect />);
    expect(mockLoadVoices).not.toHaveBeenCalled();
  });
});
