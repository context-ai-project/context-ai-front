import { formatDuration } from '../format-duration';

describe('formatDuration', () => {
  it('formats 0 seconds', () => {
    expect(formatDuration(0)).toBe('0:00 min');
  });

  it('formats seconds less than a minute', () => {
    expect(formatDuration(45)).toBe('0:45 min');
  });

  it('formats exactly one minute', () => {
    expect(formatDuration(60)).toBe('1:00 min');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05 min');
  });

  it('pads single-digit seconds', () => {
    expect(formatDuration(63)).toBe('1:03 min');
  });

  it('handles large values', () => {
    expect(formatDuration(3661)).toBe('61:01 min');
  });
});
