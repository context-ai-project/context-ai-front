import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SectorFormDialog } from '../SectorFormDialog';
import type { Sector } from '@/types/sector.types';

// ── Mock store ───────────────────────────────────────────────────────────────

const mockAddSector = vi.fn();
const mockUpdateSector = vi.fn();
const mockSectorNameExists = vi.fn().mockReturnValue(false);
const mockFindSimilarNames = vi.fn().mockReturnValue([]);
const formNamePlaceholder = 'form.namePlaceholder';
const formDescriptionPlaceholder = 'form.descriptionPlaceholder';

vi.mock('@/stores/sector.store', () => ({
  useAddSector: () => mockAddSector,
  useUpdateSector: () => mockUpdateSector,
  useSectorNameExists: () => mockSectorNameExists,
  useFindSimilarNames: () => mockFindSimilarNames,
}));

const existingSector: Sector = {
  id: 's1',
  name: 'HR Department',
  description: 'Human resources department managing all employee relations and policies',
  icon: 'users',
  status: 'active',
  documentCount: 3,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('SectorFormDialog', () => {
  const onOpenChange = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddSector.mockResolvedValue(undefined);
    mockUpdateSector.mockResolvedValue(undefined);
    mockSectorNameExists.mockReturnValue(false);
    mockFindSimilarNames.mockReturnValue([]);
  });

  it('should render create title when no sector is provided', () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    expect(screen.getByText('form.createTitle')).toBeInTheDocument();
  });

  it('should render edit title when sector is provided', () => {
    render(
      <SectorFormDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={existingSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('form.editTitle')).toBeInTheDocument();
  });

  it('should render name and description fields', () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    expect(screen.getByPlaceholderText(formNamePlaceholder)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(formDescriptionPlaceholder)).toBeInTheDocument();
  });

  it('should render icon selector', () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    expect(screen.getByText('form.icon')).toBeInTheDocument();
    expect(screen.getByText('form.selectIcon')).toBeInTheDocument();
  });

  it('should render submit button with create label', () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    expect(screen.getByText('form.createButton')).toBeInTheDocument();
  });

  it('should render submit button with save label in edit mode', () => {
    render(
      <SectorFormDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={existingSector}
        onSuccess={onSuccess}
      />,
    );

    expect(screen.getByText('form.saveButton')).toBeInTheDocument();
  });

  it('should pre-fill form fields in edit mode', () => {
    render(
      <SectorFormDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={existingSector}
        onSuccess={onSuccess}
      />,
    );

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder) as HTMLInputElement;
    const descInput = screen.getByPlaceholderText(
      formDescriptionPlaceholder,
    ) as HTMLTextAreaElement;

    expect(nameInput.value).toBe('HR Department');
    expect(descInput.value).toBe(
      'Human resources department managing all employee relations and policies',
    );
  });

  it('should show validation error for empty name on blur', async () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder);
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('validation.nameRequired')).toBeInTheDocument();
    });
  });

  it('should show validation error for empty description on blur', async () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const descInput = screen.getByPlaceholderText(formDescriptionPlaceholder);
    fireEvent.blur(descInput);

    await waitFor(() => {
      expect(screen.getByText('validation.descriptionRequired')).toBeInTheDocument();
    });
  });

  it('should show validation error for short name', async () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder);
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('validation.nameMinLength')).toBeInTheDocument();
    });
  });

  it('should show validation error for short description', async () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const descInput = screen.getByPlaceholderText(formDescriptionPlaceholder);
    fireEvent.change(descInput, { target: { value: 'Short' } });
    fireEvent.blur(descInput);

    await waitFor(() => {
      expect(screen.getByText('validation.descriptionMinLength')).toBeInTheDocument();
    });
  });

  it('should show name exists error', async () => {
    mockSectorNameExists.mockReturnValue(true);

    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder);
    fireEvent.change(nameInput, { target: { value: 'Existing Name' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('validation.nameExists')).toBeInTheDocument();
    });
  });

  it('should call addSector on create submission', async () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder);
    const descInput = screen.getByPlaceholderText(formDescriptionPlaceholder);

    fireEvent.change(nameInput, { target: { value: 'New Sector' } });
    fireEvent.change(descInput, { target: { value: 'This is a new sector description' } });

    const form = screen.getByText('form.createButton').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockAddSector).toHaveBeenCalledWith({
        name: 'New Sector',
        description: 'This is a new sector description',
        icon: 'layout',
      });
    });
  });

  it('should call updateSector on edit submission', async () => {
    render(
      <SectorFormDialog
        open={true}
        onOpenChange={onOpenChange}
        sector={existingSector}
        onSuccess={onSuccess}
      />,
    );

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder);

    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const form = screen.getByText('form.saveButton').closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpdateSector).toHaveBeenCalledWith('s1', { name: 'Updated Name' });
    });
  });

  it('should show character count', () => {
    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    expect(screen.getByText('0/50')).toBeInTheDocument();
    expect(screen.getByText('0/300')).toBeInTheDocument();
  });

  it('should handle similar names warning', async () => {
    mockFindSimilarNames.mockReturnValue(['HR Dept']);

    render(<SectorFormDialog open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />);

    const nameInput = screen.getByPlaceholderText(formNamePlaceholder);
    fireEvent.change(nameInput, { target: { value: 'HR Department' } });

    await waitFor(() => {
      expect(screen.getByText('validation.nameSimilar')).toBeInTheDocument();
    });
  });
});
