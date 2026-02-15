import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToggleStatusDialog } from '../ToggleStatusDialog';
import type { Sector } from '@/types/sector.types';

// Mock the sector store
const mockToggleSectorStatus = vi.fn();
vi.mock('@/stores/sector.store', () => ({
  useToggleSectorStatus: () => mockToggleSectorStatus,
}));

const activeSector: Sector = {
  id: 's1',
  name: 'HR',
  description: 'Human Resources',
  icon: 'users',
  status: 'active',
  documentCount: 3,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const inactiveSector: Sector = {
  ...activeSector,
  status: 'inactive',
};

describe('ToggleStatusDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when sector is null', () => {
    const { container } = render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={null}
        onSuccess={onSuccess}
      />,
    );

    expect(container.querySelector('[role="alertdialog"]')).not.toBeInTheDocument();
  });

  it('should show deactivate title for active sectors', () => {
    render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={activeSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('deactivateTitle')).toBeInTheDocument();
    expect(screen.getByText('deactivateMessage')).toBeInTheDocument();
  });

  it('should show activate title for inactive sectors', () => {
    render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={inactiveSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('activateTitle')).toBeInTheDocument();
    expect(screen.getByText('activateMessage')).toBeInTheDocument();
  });

  it('should render confirm and cancel buttons', () => {
    render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={activeSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('confirm')).toBeInTheDocument();
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('should call toggleSectorStatus and onSuccess on confirm', async () => {
    mockToggleSectorStatus.mockResolvedValue(undefined);

    render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={activeSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(mockToggleSectorStatus).toHaveBeenCalledWith('s1');
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should call onOpenChange(false) after toggle', async () => {
    mockToggleSectorStatus.mockResolvedValue(undefined);

    render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={activeSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle toggle failure gracefully', async () => {
    mockToggleSectorStatus.mockRejectedValue(new Error('Toggle failed'));

    render(
      <ToggleStatusDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={activeSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
