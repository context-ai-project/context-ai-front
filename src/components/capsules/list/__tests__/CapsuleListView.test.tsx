import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleListView } from '../CapsuleListView';
import type { CapsuleDto } from '@/lib/api/capsule.api';

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    listCapsules: vi.fn(),
  },
}));

vi.mock('@/components/capsules/list/CapsuleCard', () => ({
  CapsuleCard: ({ capsule }: { capsule: CapsuleDto }) => (
    <div data-testid="capsule-card">{capsule.title}</div>
  ),
}));

vi.mock('@/components/capsules/list/CapsuleFilters', () => ({
  CapsuleFilters: () => <div data-testid="capsule-filters" />,
}));

vi.mock('@/components/capsules/list/DeleteCapsuleDialog', () => ({
  DeleteCapsuleDialog: () => null,
}));

vi.mock('@/lib/utils/get-user-role', () => ({
  getUserRole: () => 'admin',
}));

vi.mock('@/constants/permissions', () => ({
  hasPermission: () => true,
  CAN_CREATE_CAPSULES: 'CAN_CREATE_CAPSULES',
  CAN_DELETE_CAPSULES: 'CAN_DELETE_CAPSULES',
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsuleListView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons initially', () => {
    vi.mocked(capsuleApi.listCapsules).mockReturnValue(new Promise(() => {}));
    render(<CapsuleListView />);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders title', () => {
    vi.mocked(capsuleApi.listCapsules).mockReturnValue(new Promise(() => {}));
    render(<CapsuleListView />);
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('renders create button for admin', () => {
    vi.mocked(capsuleApi.listCapsules).mockReturnValue(new Promise(() => {}));
    render(<CapsuleListView />);
    expect(screen.getByText('create')).toBeInTheDocument();
  });

  it('shows empty state when no capsules returned', async () => {
    vi.mocked(capsuleApi.listCapsules).mockResolvedValueOnce({ data: [], total: 0 });
    render(<CapsuleListView />);
    await waitFor(() => {
      expect(screen.getByText('list.empty')).toBeInTheDocument();
    });
  });

  it('shows capsule cards when data is present', async () => {
    const capsules = [
      { id: 'c1', title: 'Cap 1', status: 'ACTIVE', type: 'AUDIO' },
      { id: 'c2', title: 'Cap 2', status: 'DRAFT', type: 'VIDEO' },
    ] as CapsuleDto[];
    vi.mocked(capsuleApi.listCapsules).mockResolvedValueOnce({ data: capsules, total: 2 });
    render(<CapsuleListView />);
    await waitFor(() => {
      expect(screen.getAllByTestId('capsule-card')).toHaveLength(2);
    });
  });

  it('renders filters', () => {
    vi.mocked(capsuleApi.listCapsules).mockReturnValue(new Promise(() => {}));
    render(<CapsuleListView />);
    expect(screen.getByTestId('capsule-filters')).toBeInTheDocument();
  });
});
