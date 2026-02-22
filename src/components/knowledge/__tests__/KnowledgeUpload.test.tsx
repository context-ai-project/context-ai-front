import { render, screen, fireEvent } from '@testing-library/react';
import { KnowledgeUpload } from '../KnowledgeUpload';

const mockMutate = vi.fn();
const mockReset = vi.fn();
const inputFile = 'input[type="file"]';
const applicationPdf = 'application/pdf';

vi.mock('@/hooks/useUploadDocument', () => ({
  useUploadDocument: () => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    reset: mockReset,
  }),
}));

// Mock sector store to provide active sectors
vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => [
    {
      id: '440e8400-e29b-41d4-a716-446655440000',
      name: 'Human Resources',
      description: '',
      icon: 'users',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
    {
      id: '440e8400-e29b-41d4-a716-446655440001',
      name: 'Engineering',
      description: '',
      icon: 'code',
      status: 'active',
      documentCount: 0,
      createdAt: '',
      updatedAt: '',
    },
  ],
  SectorStoreProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Controllable mock for useSession
const mockSessionData = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockSessionData(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const adminSession = {
  data: {
    user: { id: 'u1', name: 'Admin', email: 'admin@test.com', roles: ['admin'] },
    accessToken: 'test-token',
    expires: new Date(Date.now() + 86400000).toISOString(),
  },
  status: 'authenticated' as const,
};

const userSession = {
  data: {
    user: { id: 'u2', name: 'User', email: 'user@test.com', roles: ['user'] },
    accessToken: 'test-token',
    expires: new Date(Date.now() + 86400000).toISOString(),
  },
  status: 'authenticated' as const,
};

/** Helper: creates a mock File */
function createFile(name: string, sizeBytes: number, type: string): File {
  const content = 'x'.repeat(sizeBytes);
  return new File([content], name, { type });
}

/** Helper: get the drop zone div (has role="button" and tabindex) */
function getDropZone(): HTMLElement {
  // The drop zone is a div with role="button" and tabindex="0"
  const buttons = screen.getAllByRole('button');
  const dropZone = buttons.find(
    (el) => el.tagName === 'DIV' && el.getAttribute('tabindex') === '0',
  );
  if (!dropZone) throw new Error('Drop zone not found');
  return dropZone;
}

describe('KnowledgeUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionData.mockReturnValue(adminSession);
  });

  // ─── Permission Gate ───────────────────────────────────────────
  describe('Permission gate', () => {
    it('should show permission error when user has "user" role', () => {
      mockSessionData.mockReturnValue(userSession);
      render(<KnowledgeUpload />);
      expect(screen.getByText('error')).toBeInTheDocument();
      expect(screen.getByText('requiresPermission')).toBeInTheDocument();
    });

    it('should show permission error when session has no roles', () => {
      mockSessionData.mockReturnValue({
        data: { user: { id: 'u3', name: 'X' }, accessToken: 't', expires: '' },
        status: 'authenticated',
      });
      render(<KnowledgeUpload />);
      expect(screen.getByText('requiresPermission')).toBeInTheDocument();
    });
  });

  // ─── Form rendering ────────────────────────────────────────────
  describe('Form rendering', () => {
    it('should render the upload form for admin users', () => {
      render(<KnowledgeUpload />);
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('subtitle')).toBeInTheDocument();
      expect(screen.getByText('uploadButton')).toBeInTheDocument();
    });

    it('should render document title input', () => {
      render(<KnowledgeUpload />);
      expect(screen.getByPlaceholderText('documentTitlePlaceholder')).toBeInTheDocument();
    });

    it('should render sector selection', () => {
      render(<KnowledgeUpload />);
      expect(screen.getByText('sector')).toBeInTheDocument();
    });

    it('should render drag-and-drop zone', () => {
      render(<KnowledgeUpload />);
      expect(screen.getByText('dropzone')).toBeInTheDocument();
      expect(screen.getByText('allowedTypes')).toBeInTheDocument();
      expect(screen.getByText('maxSize')).toBeInTheDocument();
    });

    it('should render source type display', () => {
      render(<KnowledgeUpload />);
      expect(screen.getByText('sourceType')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });

  // ─── File handling ─────────────────────────────────────────────
  describe('File handling', () => {
    it('should accept a valid PDF file', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('test.pdf', 1024, applicationPdf);
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('should accept a valid markdown file', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('readme.md', 512, 'text/markdown');
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();
    });

    it('should fallback to extension for unknown MIME types (.md)', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('doc.md', 256, 'application/octet-stream');
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();
    });

    it('should fallback to extension for .txt files', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('notes.txt', 128, 'application/octet-stream');
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();
    });

    it('should fallback to extension for .pdf files', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('report.pdf', 128, 'application/octet-stream');
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();
    });

    it('should reject file with unsupported type and extension', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('image.png', 1024, 'image/png');
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.queryByText('fileSelected')).not.toBeInTheDocument();
    });

    it('should reject file that exceeds max size (10MB)', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const bigFile = createFile('huge.pdf', 11 * 1024 * 1024, applicationPdf);
      fireEvent.change(fileInput, { target: { files: [bigFile] } });

      expect(screen.queryByText('fileSelected')).not.toBeInTheDocument();
    });

    it('should auto-fill title from filename when title is empty', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;
      const titleInput = screen.getByPlaceholderText('documentTitlePlaceholder');

      const file = createFile('my-document.pdf', 1024, applicationPdf);
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(titleInput).toHaveValue('my-document');
    });

    it('should allow removing selected file', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      const file = createFile('test.pdf', 1024, applicationPdf);
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();

      const removeBtn = screen.getByLabelText('Remove file');
      fireEvent.click(removeBtn);

      expect(screen.queryByText('fileSelected')).not.toBeInTheDocument();
      expect(screen.getByText('dropzone')).toBeInTheDocument();
    });

    it('should handle null file gracefully', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;

      fireEvent.change(fileInput, { target: { files: [] } });

      expect(screen.getByText('dropzone')).toBeInTheDocument();
    });

    it('should not overwrite existing title when file is selected', () => {
      render(<KnowledgeUpload />);
      const titleInput = screen.getByPlaceholderText('documentTitlePlaceholder');

      // Set title first
      fireEvent.change(titleInput, { target: { value: 'Custom Title' } });

      const fileInput = document.querySelector(inputFile) as HTMLInputElement;
      const file = createFile('test.pdf', 1024, applicationPdf);
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Title should remain the custom one
      expect(titleInput).toHaveValue('Custom Title');
    });
  });

  // ─── Drag and drop ─────────────────────────────────────────────
  describe('Drag and drop', () => {
    it('should show active state on dragover', () => {
      render(<KnowledgeUpload />);
      const dropZone = getDropZone();

      fireEvent.dragOver(dropZone);

      expect(screen.getByText('dropzoneActive')).toBeInTheDocument();
    });

    it('should reset on dragleave', () => {
      render(<KnowledgeUpload />);
      const dropZone = getDropZone();

      fireEvent.dragOver(dropZone);
      expect(screen.getByText('dropzoneActive')).toBeInTheDocument();

      fireEvent.dragLeave(dropZone);
      expect(screen.getByText('dropzone')).toBeInTheDocument();
    });

    it('should accept file on drop', () => {
      render(<KnowledgeUpload />);
      const dropZone = getDropZone();
      const file = createFile('dropped.pdf', 1024, applicationPdf);

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      expect(screen.getByText('fileSelected')).toBeInTheDocument();
    });
  });

  // ─── Keyboard interaction ──────────────────────────────────────
  describe('Keyboard interaction', () => {
    it('should trigger file input on Enter key', () => {
      render(<KnowledgeUpload />);
      const dropZone = getDropZone();
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropZone, { key: 'Enter' });

      expect(clickSpy).toHaveBeenCalled();
    });

    it('should trigger file input on Space key', () => {
      render(<KnowledgeUpload />);
      const dropZone = getDropZone();
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;
      const clickSpy = vi.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropZone, { key: ' ' });

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // ─── Form submission ───────────────────────────────────────────
  describe('Form submission', () => {
    it('should submit button be disabled when form is incomplete', () => {
      render(<KnowledgeUpload />);
      const submitBtn = screen.getByText('uploadButton');
      expect(submitBtn.closest('button')).toBeDisabled();
    });

    it('should keep button disabled when only file is selected (no sector)', () => {
      render(<KnowledgeUpload />);
      const fileInput = document.querySelector(inputFile) as HTMLInputElement;
      const file = createFile('test.pdf', 1024, applicationPdf);
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Title is auto-filled but sector is still missing
      const submitBtn = screen.getByText('uploadButton');
      expect(submitBtn.closest('button')).toBeDisabled();
    });

    it('should render sector combobox that can be opened', () => {
      render(<KnowledgeUpload />);
      const sectorTrigger = screen.getByRole('combobox');
      expect(sectorTrigger).toBeInTheDocument();
    });
  });

  // ─── Manager role ──────────────────────────────────────────────
  describe('Manager role', () => {
    it('should render the form for manager users', () => {
      mockSessionData.mockReturnValue({
        data: {
          user: { id: 'u4', name: 'Manager', email: 'm@test.com', roles: ['manager'] },
          accessToken: 'token',
          expires: new Date(Date.now() + 86400000).toISOString(),
        },
        status: 'authenticated',
      });

      render(<KnowledgeUpload />);
      expect(screen.getByText('title')).toBeInTheDocument();
      expect(screen.getByText('uploadButton')).toBeInTheDocument();
    });
  });
});
