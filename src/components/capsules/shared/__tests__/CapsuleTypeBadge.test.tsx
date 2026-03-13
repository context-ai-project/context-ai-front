import { render, screen } from '@testing-library/react';
import { CapsuleTypeBadge } from '../CapsuleTypeBadge';

describe('CapsuleTypeBadge', () => {
  it('renders Audio label for AUDIO type', () => {
    render(<CapsuleTypeBadge type="AUDIO" />);
    expect(screen.getByText('Audio')).toBeInTheDocument();
  });

  it('renders Video label for VIDEO type', () => {
    render(<CapsuleTypeBadge type="VIDEO" />);
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(<CapsuleTypeBadge type="AUDIO" />);
    expect(container.firstChild).toBeTruthy();
  });
});
