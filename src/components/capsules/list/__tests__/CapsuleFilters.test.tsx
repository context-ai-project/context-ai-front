import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CapsuleFilters } from '../CapsuleFilters';

vi.mock('@/stores/sector.store', () => ({
  useActiveSectors: () => [
    { id: 's1', name: 'HR' },
    { id: 's2', name: 'Finance' },
  ],
}));

describe('CapsuleFilters', () => {
  const onChange = vi.fn();
  const defaultFilters = { limit: 50 };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<CapsuleFilters filters={defaultFilters} onChange={onChange} />);
    expect(screen.getByPlaceholderText('list.search')).toBeInTheDocument();
  });

  it('calls onChange with search value', async () => {
    const user = userEvent.setup();
    render(<CapsuleFilters filters={defaultFilters} onChange={onChange} />);
    const input = screen.getByPlaceholderText('list.search');
    await user.type(input, 'test');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders filter triggers', () => {
    render(<CapsuleFilters filters={defaultFilters} onChange={onChange} />);
    const allTexts = screen.getAllByText(/filter/i);
    expect(allTexts.length).toBeGreaterThanOrEqual(1);
  });
});
