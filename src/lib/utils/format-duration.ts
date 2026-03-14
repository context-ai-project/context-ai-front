/**
 * Format a duration in seconds to a human-readable "m:ss min" string.
 *
 * Extracted from CapsulePlayerView, CapsuleCard, and CapsulePreviewPanel
 * to eliminate code duplication (CS-01).
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s} min`;
}
