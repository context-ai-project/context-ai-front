import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CAN_VIEW_SECTORS, CAN_UPLOAD, CAN_VIEW_ADMIN } from '@/constants/permissions';

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockRedirect = vi.fn();
const mockAuth = vi.fn();
const mockIsE2ETestMode = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => {
    mockRedirect(...args);
    // redirect throws in real Next.js — simulate that
    throw new Error('NEXT_REDIRECT');
  },
}));

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/test-auth', () => ({
  isE2ETestMode: () => mockIsE2ETestMode(),
}));

// Import AFTER mocks are defined
const { requireRole } = await import('../require-role');

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(roles: string[]) {
  return {
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      roles,
    },
    accessToken: 'test-token',
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('requireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsE2ETestMode.mockReturnValue(false);
  });

  it('should allow access when user has the required role', async () => {
    mockAuth.mockResolvedValue(makeSession(['admin']));

    // Should not throw (no redirect)
    await requireRole(CAN_VIEW_SECTORS, 'en');

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user lacks the required role', async () => {
    mockAuth.mockResolvedValue(makeSession(['user']));

    await expect(requireRole(CAN_VIEW_SECTORS, 'en')).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/en/dashboard');
  });

  it('should redirect to sign-in when there is no session', async () => {
    mockAuth.mockResolvedValue(null);

    await expect(requireRole(CAN_VIEW_SECTORS, 'en')).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/en/auth/signin');
  });

  it('should allow manager access to CAN_UPLOAD routes', async () => {
    mockAuth.mockResolvedValue(makeSession(['manager']));

    await requireRole(CAN_UPLOAD, 'en');

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('should deny user access to CAN_UPLOAD routes', async () => {
    mockAuth.mockResolvedValue(makeSession(['user']));

    await expect(requireRole(CAN_UPLOAD, 'es')).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/es/dashboard');
  });

  it('should deny manager access to admin-only routes', async () => {
    mockAuth.mockResolvedValue(makeSession(['manager']));

    await expect(requireRole(CAN_VIEW_ADMIN, 'en')).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/en/dashboard');
  });

  it('should skip role check in E2E test mode', async () => {
    mockIsE2ETestMode.mockReturnValue(true);
    // No session at all — would normally redirect
    mockAuth.mockResolvedValue(null);

    await requireRole(CAN_VIEW_SECTORS, 'en');

    expect(mockRedirect).not.toHaveBeenCalled();
    // auth() should NOT be called in E2E mode
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it('should use the correct locale for redirect URLs', async () => {
    mockAuth.mockResolvedValue(makeSession(['user']));

    await expect(requireRole(CAN_VIEW_SECTORS, 'es')).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/es/dashboard');
  });

  it('should default to user role when roles array is empty', async () => {
    mockAuth.mockResolvedValue(makeSession([]));

    await expect(requireRole(CAN_VIEW_ADMIN, 'en')).rejects.toThrow('NEXT_REDIRECT');

    expect(mockRedirect).toHaveBeenCalledWith('/en/dashboard');
  });
});
