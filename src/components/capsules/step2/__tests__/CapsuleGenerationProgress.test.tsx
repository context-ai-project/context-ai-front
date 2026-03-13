import { render, screen } from '@testing-library/react';
import { CapsuleGenerationProgress } from '../CapsuleGenerationProgress';

let mockProgress = 50;
let mockCapsuleType = 'VIDEO';

vi.mock('@/stores/capsule.store', () => ({
  useGenerationProgress: () => mockProgress,
  useCurrentCapsule: () => ({ type: mockCapsuleType }),
}));

describe('CapsuleGenerationProgress', () => {
  beforeEach(() => {
    mockProgress = 50;
    mockCapsuleType = 'VIDEO';
  });

  it('renders nothing for DRAFT status', () => {
    const { container } = render(<CapsuleGenerationProgress status="DRAFT" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for COMPLETED status', () => {
    const { container } = render(<CapsuleGenerationProgress status="COMPLETED" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders progress for GENERATING_ASSETS', () => {
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders progress for RENDERING', () => {
    render(<CapsuleGenerationProgress status="RENDERING" />);
    expect(screen.getByText('title')).toBeInTheDocument();
  });

  it('shows video hint for VIDEO capsules', () => {
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('videoHint')).toBeInTheDocument();
  });

  it('shows audio hint for AUDIO capsules', () => {
    mockCapsuleType = 'AUDIO';
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('hint')).toBeInTheDocument();
  });

  it('shows generatingImages stage for VIDEO when progress < 40', () => {
    mockProgress = 20;
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('generatingImages')).toBeInTheDocument();
  });

  it('shows generatingAudio stage for VIDEO when 40 <= progress < 80', () => {
    mockProgress = 50;
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('generatingAudio')).toBeInTheDocument();
  });

  it('shows uploading stage for VIDEO when progress >= 80', () => {
    mockProgress = 90;
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('uploading')).toBeInTheDocument();
  });

  it('shows assemblingVideo stage for VIDEO RENDERING', () => {
    render(<CapsuleGenerationProgress status="RENDERING" />);
    expect(screen.getByText('assemblingVideo')).toBeInTheDocument();
  });

  it('shows synthesizing stage for AUDIO when progress < 80', () => {
    mockCapsuleType = 'AUDIO';
    mockProgress = 30;
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('synthesizing')).toBeInTheDocument();
  });

  it('shows uploading stage for AUDIO when progress >= 80', () => {
    mockCapsuleType = 'AUDIO';
    mockProgress = 85;
    render(<CapsuleGenerationProgress status="GENERATING_ASSETS" />);
    expect(screen.getByText('uploading')).toBeInTheDocument();
  });
});
