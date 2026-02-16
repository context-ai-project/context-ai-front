import { getUserRole } from '../get-user-role';

describe('getUserRole', () => {
  it('should return the first role when roles array has elements', () => {
    expect(getUserRole(['admin', 'manager'])).toBe('admin');
  });

  it('should return "user" when roles array is empty', () => {
    expect(getUserRole([])).toBe('user');
  });

  it('should return "user" when roles is undefined', () => {
    expect(getUserRole(undefined)).toBe('user');
  });

  it('should return "user" when roles is not an array', () => {
    // Edge case: roles might be incorrectly typed at runtime
    expect(getUserRole(undefined)).toBe('user');
  });

  it('should return "manager" when it is the first role', () => {
    expect(getUserRole(['manager'])).toBe('manager');
  });

  it('should return "user" for a regular user role', () => {
    expect(getUserRole(['user'])).toBe('user');
  });
});
