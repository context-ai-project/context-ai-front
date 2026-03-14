import { formatDate, formatDateTime } from '../format-date';

describe('formatDate', () => {
  const iso = '2026-02-15T10:30:00Z';

  it('formats date in English by default', () => {
    const result = formatDate(iso);
    expect(result).toContain('Feb');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('formats date in Spanish', () => {
    const result = formatDate(iso, 'es');
    expect(result).toContain('2026');
    expect(result).toContain('15');
  });

  it('falls back to en-US for unknown locale', () => {
    const result = formatDate(iso, 'fr');
    expect(result).toContain('Feb');
  });
});

describe('formatDateTime', () => {
  const iso = '2026-06-10T14:30:00Z';

  it('includes time in en format', () => {
    const result = formatDateTime(iso);
    expect(result).toContain('Jun');
    expect(result).toContain('10');
  });

  it('includes time in es format', () => {
    const result = formatDateTime(iso, 'es');
    expect(result).toContain('10');
  });

  it('falls back to en-US for unknown locale', () => {
    const result = formatDateTime(iso, 'xx');
    expect(result).toContain('Jun');
  });
});
