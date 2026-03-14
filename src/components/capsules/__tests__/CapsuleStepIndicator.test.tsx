import { render, screen } from '@testing-library/react';
import { CapsuleStepIndicator } from '../CapsuleStepIndicator';

vi.mock('@/stores/capsule.store', () => ({
  useCurrentStep: () => 1,
}));

describe('CapsuleStepIndicator', () => {
  it('renders step 1 and step 2 labels', () => {
    render(<CapsuleStepIndicator />);
    expect(screen.getByText('step1Title')).toBeInTheDocument();
    expect(screen.getByText('step2Title')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<CapsuleStepIndicator />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('has a nav with aria-label', () => {
    render(<CapsuleStepIndicator />);
    expect(screen.getByRole('navigation', { name: 'Wizard steps' })).toBeInTheDocument();
  });

  it('highlights current step', () => {
    render(<CapsuleStepIndicator />);
    const step1Circle = screen.getByText('1');
    expect(step1Circle.className).toContain('bg-primary');
  });
});
