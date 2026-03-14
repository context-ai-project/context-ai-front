import { render, screen } from '@testing-library/react';
import { CapsuleSectorSelect } from '../CapsuleSectorSelect';

const mockSetSelectedSectorId = vi.fn();

vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => [
    { id: 's1', name: 'HR' },
    { id: 's2', name: 'Finance' },
  ],
}));

vi.mock('@/stores/capsule.store', () => ({
  useSelectedSectorId: () => null,
  useSetSelectedSectorId: () => mockSetSelectedSectorId,
}));

describe('CapsuleSectorSelect', () => {
  it('renders sector label', () => {
    render(<CapsuleSectorSelect />);
    const labels = screen.getAllByText('selectSector');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders without crashing', () => {
    const { container } = render(<CapsuleSectorSelect />);
    expect(container.firstChild).toBeTruthy();
  });
});
