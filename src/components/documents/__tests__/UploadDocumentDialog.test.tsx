import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadDocumentDialog } from '../UploadDocumentDialog';

const mockResetForm = vi.fn();

vi.mock('@/hooks/useDocumentUpload', () => ({
  ACCEPTED_MIME_TYPES: '.pdf,.md,.txt',
  useDocumentUpload: () => ({
    file: null,
    title: '',
    sectorId: '',
    isUploading: false,
    error: null,
    isDragOver: false,
    isFormValid: false,
    fileRef: { current: null },
    setTitle: vi.fn(),
    setSectorId: vi.fn(),
    handleFileSelect: vi.fn(),
    handleDrop: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragLeave: vi.fn(),
    handleUpload: vi.fn().mockResolvedValue(null),
    resetForm: mockResetForm,
  }),
}));

vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => [
    { id: 's1', name: 'HR' },
    { id: 's2', name: 'Finance' },
  ],
}));

describe('UploadDocumentDialog', () => {
  const onDocumentUploaded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<UploadDocumentDialog onDocumentUploaded={onDocumentUploaded} />);
    expect(screen.getByText('uploadButton')).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<UploadDocumentDialog onDocumentUploaded={onDocumentUploaded} />);
    await user.click(screen.getByText('uploadButton'));
    expect(screen.getByText('uploadDialog.title')).toBeInTheDocument();
  });

  it('renders title and file inputs inside dialog', async () => {
    const user = userEvent.setup();
    render(<UploadDocumentDialog onDocumentUploaded={onDocumentUploaded} />);
    await user.click(screen.getByText('uploadButton'));
    expect(screen.getByLabelText('uploadDialog.documentTitle')).toBeInTheDocument();
    expect(screen.getByLabelText('uploadDialog.file')).toBeInTheDocument();
  });

  it('renders submit button as disabled when form is not valid', async () => {
    const user = userEvent.setup();
    render(<UploadDocumentDialog onDocumentUploaded={onDocumentUploaded} />);
    await user.click(screen.getByText('uploadButton'));
    const submitBtn = screen.getByText('uploadAndIndex');
    expect(submitBtn).toBeDisabled();
  });
});
