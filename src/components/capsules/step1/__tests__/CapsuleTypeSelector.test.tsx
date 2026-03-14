import { render, screen, fireEvent } from '@testing-library/react';
import { CapsuleTypeSelector } from '../CapsuleTypeSelector';

const mockSetCapsuleType = vi.fn();

vi.mock('@/stores/capsule.store', () => ({
  useCapsuleType: () => 'AUDIO',
  useSetCapsuleType: () => mockSetCapsuleType,
}));

describe('CapsuleTypeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders type label', () => {
    render(<CapsuleTypeSelector />);
    expect(screen.getByText('selectType')).toBeInTheDocument();
  });

  it('renders audio and video options', () => {
    render(<CapsuleTypeSelector />);
    expect(screen.getByText('typeAudio')).toBeInTheDocument();
    expect(screen.getByText('typeVideo')).toBeInTheDocument();
  });

  it('calls setCapsuleType when an option is clicked', () => {
    render(<CapsuleTypeSelector />);
    fireEvent.click(screen.getByText('typeVideo'));
    expect(mockSetCapsuleType).toHaveBeenCalledWith('VIDEO');
  });

  it('highlights the selected type', () => {
    render(<CapsuleTypeSelector />);
    const audioBtn = screen.getByText('typeAudio').closest('button');
    expect(audioBtn?.className).toContain('border-primary');
  });
});
