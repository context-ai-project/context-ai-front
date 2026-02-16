import { render, screen, fireEvent } from '@testing-library/react';
import { SectorCard } from '../SectorCard';
import type { Sector } from '@/types/sector.types';

const baseSector: Sector = {
  id: 's1',
  name: 'Human Resources',
  description: 'HR department sector',
  icon: 'users',
  status: 'active',
  documentCount: 5,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-06-15T12:00:00Z',
};

describe('SectorCard', () => {
  const onClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sector name and description', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    expect(screen.getByText('Human Resources')).toBeInTheDocument();
    expect(screen.getByText('HR department sector')).toBeInTheDocument();
  });

  it('should display active badge for active sectors', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('should display inactive badge for inactive sectors', () => {
    const inactive: Sector = { ...baseSector, status: 'inactive' };
    render(<SectorCard sector={inactive} onClick={onClick} />);

    expect(screen.getByText('inactive')).toBeInTheDocument();
  });

  it('should show document count', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    expect(screen.getByText('documentCount')).toBeInTheDocument();
  });

  it('should show formatted updatedAt date', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    expect(screen.getByText('updatedAt')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledWith(baseSector);
  });

  it('should call onClick on Enter key', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

    expect(onClick).toHaveBeenCalledWith(baseSector);
  });

  it('should call onClick on Space key', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });

    expect(onClick).toHaveBeenCalledWith(baseSector);
  });

  it('should not call onClick on other keys', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('should have reduced opacity for inactive sectors', () => {
    const inactive: Sector = { ...baseSector, status: 'inactive' };
    render(<SectorCard sector={inactive} onClick={onClick} />);

    const card = screen.getByRole('button');
    expect(card.className).toContain('opacity-60');
  });

  it('should have appropriate aria-label', () => {
    render(<SectorCard sector={baseSector} onClick={onClick} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Human Resources — active');
  });
});
