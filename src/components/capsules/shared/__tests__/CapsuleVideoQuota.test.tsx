import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleVideoQuota } from '../CapsuleVideoQuota';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getQuota: vi.fn(),
  },
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsuleVideoQuota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when quota fetch fails', async () => {
    vi.mocked(capsuleApi.getQuota).mockRejectedValueOnce(new Error('fail'));
    const { container } = render(<CapsuleVideoQuota />);
    await waitFor(() => {
      expect(container.innerHTML).toBe('');
    });
  });

  it('renders usage info when quota is available', async () => {
    vi.mocked(capsuleApi.getQuota).mockResolvedValueOnce({
      used: 3,
      limit: 10,
      remaining: 7,
      capsulesCost: 1,
      capsulesRemaining: 7,
    });
    render(<CapsuleVideoQuota />);
    await waitFor(() => {
      expect(screen.getByText('used')).toBeInTheDocument();
    });
  });

  it('renders exhausted message when remaining is 0', async () => {
    vi.mocked(capsuleApi.getQuota).mockResolvedValueOnce({
      used: 10,
      limit: 10,
      remaining: 0,
      capsulesCost: 1,
      capsulesRemaining: 0,
    });
    render(<CapsuleVideoQuota />);
    await waitFor(() => {
      expect(screen.getByText('exhausted')).toBeInTheDocument();
    });
  });

  it('shows warning style when usage is above 80%', async () => {
    vi.mocked(capsuleApi.getQuota).mockResolvedValueOnce({
      used: 9,
      limit: 10,
      remaining: 1,
      capsulesCost: 1,
      capsulesRemaining: 1,
    });
    const { container } = render(<CapsuleVideoQuota />);
    await waitFor(() => {
      expect(container.firstChild).toBeTruthy();
      expect((container.firstChild as HTMLElement).className).toContain('border-yellow');
    });
  });
});
