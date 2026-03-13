import { render, screen, waitFor } from '@testing-library/react';
import { CapsuleResumeWizard } from '../CapsuleResumeWizard';

vi.mock('../CapsuleStepIndicator', () => ({
  CapsuleStepIndicator: () => <div data-testid="step-indicator" />,
}));

vi.mock('../step2/CapsuleFormPanel', () => ({
  CapsuleFormPanel: ({ onBack }: { onBack?: () => void }) => (
    <div data-testid="form-panel">
      <button onClick={onBack}>back</button>
    </div>
  ),
}));

vi.mock('../step2/CapsulePreviewPanel', () => ({
  CapsulePreviewPanel: () => <div data-testid="preview-panel" />,
}));

const mockResumeWizard = vi.fn();

vi.mock('@/stores/capsule.store', () => ({
  useResumeWizard: () => mockResumeWizard,
}));

vi.mock('@/lib/api/capsule.api', () => ({
  capsuleApi: {
    getCapsule: vi.fn(),
  },
}));

import { capsuleApi } from '@/lib/api/capsule.api';

describe('CapsuleResumeWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(capsuleApi.getCapsule).mockReturnValue(new Promise(() => {}));
    render(<CapsuleResumeWizard capsuleId="c1" locale="en" />);
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('renders form and preview panels after loading', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce({
      id: 'c1',
      title: 'Test',
      status: 'DRAFT',
      script: 'text',
    });
    render(<CapsuleResumeWizard capsuleId="c1" locale="en" />);
    await waitFor(() => {
      expect(screen.getByTestId('form-panel')).toBeInTheDocument();
      expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    });
    expect(mockResumeWizard).toHaveBeenCalled();
  });

  it('shows error when capsule load fails', async () => {
    vi.mocked(capsuleApi.getCapsule).mockRejectedValueOnce(new Error('Not found'));
    render(<CapsuleResumeWizard capsuleId="c1" locale="en" />);
    await waitFor(() => {
      expect(screen.getByText('Not found')).toBeInTheDocument();
    });
  });

  it('renders step indicator after loading', async () => {
    vi.mocked(capsuleApi.getCapsule).mockResolvedValueOnce({
      id: 'c1',
      title: 'Test',
      status: 'DRAFT',
      script: '',
    });
    render(<CapsuleResumeWizard capsuleId="c1" locale="en" />);
    await waitFor(() => {
      expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
    });
  });
});
