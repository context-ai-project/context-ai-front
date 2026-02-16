import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteSectorDialog } from '../DeleteSectorDialog';
import type { Sector } from '@/types/sector.types';

// Mock the sector store
const mockDeleteSector = vi.fn();
vi.mock('@/stores/sector.store', () => ({
  useDeleteSector: () => mockDeleteSector,
}));

const baseSector: Sector = {
  id: 's1',
  name: 'HR',
  description: 'Human Resources',
  icon: 'users',
  status: 'active',
  documentCount: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('DeleteSectorDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when sector is null', () => {
    const { container } = render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={null}
        onSuccess={onSuccess}
      />,
    );

    expect(container.querySelector('[role="alertdialog"]')).not.toBeInTheDocument();
  });

  it('should render title when sector is provided', () => {
    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('should show delete message for sectors without documents', () => {
    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('message')).toBeInTheDocument();
    expect(screen.getByText('confirm')).toBeInTheDocument();
  });

  it('should show warning for sectors with documents', () => {
    const withDocs: Sector = { ...baseSector, documentCount: 3 };
    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={withDocs}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('hasDocuments')).toBeInTheDocument();
    // Confirm button should not be visible
    expect(screen.queryByText('confirm')).not.toBeInTheDocument();
  });

  it('should call deleteSector and onSuccess when confirmed', async () => {
    mockDeleteSector.mockResolvedValue(true);

    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(mockDeleteSector).toHaveBeenCalledWith('s1');
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should call onOpenChange(false) after delete', async () => {
    mockDeleteSector.mockResolvedValue(true);

    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('should handle delete failure gracefully', async () => {
    mockDeleteSector.mockRejectedValue(new Error('Delete failed'));

    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should not call onSuccess when delete returns false', async () => {
    mockDeleteSector.mockResolvedValue(false);

    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    fireEvent.click(screen.getByText('confirm'));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should render cancel button', () => {
    render(
      <DeleteSectorDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={baseSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('cancel')).toBeInTheDocument();
  });
});
