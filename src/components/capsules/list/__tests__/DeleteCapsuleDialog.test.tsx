import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteCapsuleDialog } from '../DeleteCapsuleDialog';
import type { CapsuleDto } from '@/lib/api/capsule.api';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    deleteCapsule: vi.fn().mockResolvedValue(undefined),
  },
}));

import { capsuleApi } from '@/lib/api/capsule.api';

const mockCapsule = {
  id: 'c1',
  title: 'Test Capsule',
  status: 'ACTIVE',
  type: 'AUDIO',
} as CapsuleDto;

describe('DeleteCapsuleDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when capsule is null', () => {
    const { container } = render(
      <DeleteCapsuleDialog open={true} onOpenChange={onOpenChange} capsule={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog title', () => {
    render(<DeleteCapsuleDialog open={true} onOpenChange={onOpenChange} capsule={mockCapsule} />);
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('renders cancel and confirm buttons', () => {
    render(<DeleteCapsuleDialog open={true} onOpenChange={onOpenChange} capsule={mockCapsule} />);
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
  });

  it('calls deleteCapsule on confirm', async () => {
    const user = userEvent.setup();
    render(
      <DeleteCapsuleDialog
        open={true}
        onOpenChange={onOpenChange}
        capsule={mockCapsule}
        onSuccess={onSuccess}
      />,
    );
    await user.click(screen.getByText('confirm'));
    expect(capsuleApi.deleteCapsule).toHaveBeenCalledWith('c1');
  });
});
