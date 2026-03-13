import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapsuleTitleInput } from '../CapsuleTitleInput';

const mockSetCapsuleTitle = vi.fn();

vi.mock('@/stores/capsule.store', () => ({
  useCapsuleTitle: () => 'My Capsule',
  useSetCapsuleTitle: () => mockSetCapsuleTitle,
}));

describe('CapsuleTitleInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and input', () => {
    render(<CapsuleTitleInput />);
    expect(screen.getByLabelText('capsuleTitle')).toBeInTheDocument();
  });

  it('displays current title value', () => {
    render(<CapsuleTitleInput />);
    expect(screen.getByDisplayValue('My Capsule')).toBeInTheDocument();
  });

  it('calls setCapsuleTitle on input change', async () => {
    const user = userEvent.setup();
    render(<CapsuleTitleInput />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'X');
    expect(mockSetCapsuleTitle).toHaveBeenCalled();
  });

  it('has a maxLength of 255', () => {
    render(<CapsuleTitleInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '255');
  });
});
