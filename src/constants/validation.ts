/**
 * Shared validation and UI constants (CS-05/CS-06).
 *
 * Replaces magic numbers scattered across InviteUserDialog,
 * NotificationBell, CapsuleGenerationProgress, and others.
 */

// ── Email / Name validation ──────────────────────────────────────────────────
export const EMAIL_MAX_LENGTH = 254;
export const NAME_MIN_LENGTH = 2;

// ── UI timeouts ──────────────────────────────────────────────────────────────
export const SUCCESS_DIALOG_CLOSE_DELAY_MS = 1_500;

// ── Notification badge ───────────────────────────────────────────────────────
export const UNREAD_BADGE_MAX = 99;

// ── Generation progress thresholds ───────────────────────────────────────────
export const PROGRESS_IMAGES_DONE = 40;
export const PROGRESS_AUDIO_DONE = 80;
export const PROGRESS_COMPLETE = 100;
