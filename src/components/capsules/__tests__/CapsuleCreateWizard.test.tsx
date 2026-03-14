import { render, screen } from '@testing-library/react';
import { CapsuleCreateWizard } from '../CapsuleCreateWizard';

vi.mock('../CapsuleStepIndicator', () => ({
  CapsuleStepIndicator: () => <div data-testid="step-indicator" />,
}));

vi.mock('../step1/CapsuleTypeSelector', () => ({
  CapsuleTypeSelector: () => <div data-testid="type-selector" />,
}));

vi.mock('../step1/CapsuleSectorSelect', () => ({
  CapsuleSectorSelect: () => <div data-testid="sector-select" />,
}));

vi.mock('../step1/CapsuleTitleInput', () => ({
  CapsuleTitleInput: () => <div data-testid="title-input" />,
}));

vi.mock('../step1/CapsuleDocumentList', () => ({
  CapsuleDocumentList: () => <div data-testid="document-list" />,
}));

vi.mock('../step2/CapsuleFormPanel', () => ({
  CapsuleFormPanel: () => <div data-testid="form-panel" />,
}));

vi.mock('../step2/CapsulePreviewPanel', () => ({
  CapsulePreviewPanel: () => <div data-testid="preview-panel" />,
}));

let mockStep = 1;

vi.mock('@/stores/capsule.store', () => ({
  useCurrentStep: () => mockStep,
  useSelectedSectorId: () => 's1',
  useCapsuleTitle: () => 'My Capsule',
  useSelectedDocumentIds: () => ['d1'],
  useIsCreating: () => false,
  useCapsuleError: () => null,
  useNextStep: () => vi.fn(),
}));

describe('CapsuleCreateWizard', () => {
  beforeEach(() => {
    mockStep = 1;
  });

  it('renders step indicator', () => {
    render(<CapsuleCreateWizard />);
    expect(screen.getByTestId('step-indicator')).toBeInTheDocument();
  });

  it('renders step 1 components when on step 1', () => {
    render(<CapsuleCreateWizard />);
    expect(screen.getByTestId('type-selector')).toBeInTheDocument();
    expect(screen.getByTestId('sector-select')).toBeInTheDocument();
    expect(screen.getByTestId('title-input')).toBeInTheDocument();
    expect(screen.getByTestId('document-list')).toBeInTheDocument();
  });

  it('renders next button on step 1', () => {
    render(<CapsuleCreateWizard />);
    expect(screen.getByText('next')).toBeInTheDocument();
  });

  it('renders step 2 components when on step 2', () => {
    mockStep = 2;
    render(<CapsuleCreateWizard />);
    expect(screen.getByTestId('form-panel')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
  });

  it('renders wizard title', () => {
    render(<CapsuleCreateWizard />);
    expect(screen.getByText('step1Title')).toBeInTheDocument();
  });
});
