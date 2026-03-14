import { getUserInitials } from '../get-user-initials';

describe('getUserInitials', () => {
  it('returns initials from two-word name', () => {
    expect(getUserInitials('Gabriela Romero')).toBe('GR');
  });

  it('returns single initial from one-word name', () => {
    expect(getUserInitials('John')).toBe('J');
  });

  it('returns fallback "U" for null', () => {
    expect(getUserInitials(null)).toBe('U');
  });

  it('returns fallback "U" for undefined', () => {
    expect(getUserInitials(undefined)).toBe('U');
  });

  it('returns fallback "U" for empty string', () => {
    expect(getUserInitials('')).toBe('U');
  });

  it('respects maxChars parameter', () => {
    expect(getUserInitials('Ana Beatriz Campos', 1)).toBe('A');
  });

  it('handles three-word name with default maxChars', () => {
    expect(getUserInitials('Ana Beatriz Campos')).toBe('AB');
  });

  it('uppercases the initials', () => {
    expect(getUserInitials('john doe')).toBe('JD');
  });

  it('ignores extra spaces', () => {
    expect(getUserInitials('  John   Doe  ')).toBe('JD');
  });
});
