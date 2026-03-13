import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteUserDialog } from '../InviteUserDialog';
import type { Sector } from '@/types/sector.types';

vi.mock('@/lib/api/invitation.api', () => ({
  invitationApi: {
    createInvitation: vi.fn(),
  },
}));

vi.mock('@/components/shared/InlineError', () => ({
  InlineError: ({ message }: { message: string }) => <div role="alert">{message}</div>,
}));

import { invitationApi } from '@/lib/api/invitation.api';

const mockSectors: Sector[] = [
  {
    id: 's1',
    name: 'HR',
    description: 'Human Resources',
    icon: 'users',
    status: 'active',
    documentCount: 5,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 's2',
    name: 'Finance',
    description: 'Finance dept',
    icon: 'briefcase',
    status: 'active',
    documentCount: 3,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 's3',
    name: 'Archived',
    description: 'Old',
    icon: 'book',
    status: 'inactive',
    documentCount: 0,
    createdAt: '',
    updatedAt: '',
  },
];

describe('InviteUserDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invitationApi.createInvitation).mockResolvedValue({
      id: 'inv-1',
      email: 'test@example.com',
      status: 'pending',
      expiresAt: '2026-01-01T00:00:00Z',
      createdByUserId: 'u1',
      createdByName: 'Admin',
      sectorIds: [],
      acceptedAt: null,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  it('renders dialog title and description', () => {
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    expect(screen.getByText('invite.title')).toBeInTheDocument();
    expect(screen.getByText('invite.description')).toBeInTheDocument();
  });

  it('renders name and email inputs', () => {
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    expect(screen.getByLabelText('invite.name')).toBeInTheDocument();
    expect(screen.getByLabelText('invite.email')).toBeInTheDocument();
  });

  it('renders only active sectors as selectable badges', () => {
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.queryByText('Archived')).not.toBeInTheDocument();
  });

  it('disables send button when name and email are empty', () => {
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    expect(screen.getByText('invite.send')).toBeDisabled();
  });

  it('calls onOpenChange on cancel click', async () => {
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.click(screen.getByText('invite.cancel'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('enables send button when name and email are filled', async () => {
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'test@example.com');
    expect(screen.getByText('invite.send')).not.toBeDisabled();
  });

  it('shows error for invalid email', async () => {
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'invalid');
    await user.click(screen.getByText('invite.send'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error for short name', async () => {
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'A');
    await user.type(screen.getByLabelText('invite.email'), 'test@example.com');
    await user.click(screen.getByText('invite.send'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows error for email without valid domain', async () => {
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'user@');
    await user.click(screen.getByText('invite.send'));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls API and shows success on valid submission', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <InviteUserDialog
        open={true}
        onOpenChange={onOpenChange}
        sectors={mockSectors}
        onSuccess={onSuccess}
      />,
    );
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'test@example.com');
    await user.click(screen.getByText('invite.send'));
    await waitFor(() => {
      expect(invitationApi.createInvitation).toHaveBeenCalled();
    });
    vi.useRealTimers();
  });

  it('shows user exists error from API', async () => {
    vi.mocked(invitationApi.createInvitation).mockRejectedValueOnce(
      new Error('User already exists'),
    );
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'test@example.com');
    await user.click(screen.getByText('invite.send'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows pending invitation error from API', async () => {
    vi.mocked(invitationApi.createInvitation).mockRejectedValueOnce(
      new Error('pending invitation exists'),
    );
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'test@example.com');
    await user.click(screen.getByText('invite.send'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows generic error for non-Error throwable', async () => {
    vi.mocked(invitationApi.createInvitation).mockRejectedValueOnce('unknown');
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.type(screen.getByLabelText('invite.name'), 'Test User');
    await user.type(screen.getByLabelText('invite.email'), 'test@example.com');
    await user.click(screen.getByText('invite.send'));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('toggles sector selection', async () => {
    const user = userEvent.setup();
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={mockSectors} />);
    await user.click(screen.getByText('HR'));
    await user.click(screen.getByText('HR'));
  });

  it('hides sector section when no active sectors', () => {
    const noActiveSectors: Sector[] = [
      {
        id: 's3',
        name: 'Archived',
        description: 'Old',
        icon: 'book',
        status: 'inactive',
        documentCount: 0,
        createdAt: '',
        updatedAt: '',
      },
    ];
    render(<InviteUserDialog open={true} onOpenChange={onOpenChange} sectors={noActiveSectors} />);
    expect(screen.queryByText('invite.sectors')).not.toBeInTheDocument();
  });
});
