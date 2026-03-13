/**
 * Chat content sanitization utilities.
 *
 * Extracted from StructuredResponse and MessageList to eliminate
 * duplicated normalize/sanitize logic (CS-03).
 */

/** Normalize string for safe comparison: trim, collapse spaces, lowercase. */
export function normalizeLine(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Returns true if the value is an internal "type: info" artifact. */
export function isInternalTypeLine(value: string): boolean {
  const n = normalizeLine(value);
  return n === 'type: info' || n === '"type":"info"';
}

/** Returns true if a line (possibly bulleted) contains only "type: info". */
export function isTypeInfoOnlyLine(line: string): boolean {
  let t = line.trim();
  const bullet = t.charAt(0);
  if (bullet === '•' || bullet === '-' || bullet === '*') t = t.slice(1).trim();
  const n = normalizeLine(t);
  return n === 'type: info' || n === '"type":"info"';
}

/** Remove lines that are only "type: info" (or bullet variants). */
export function sanitizeContent(text: string): string {
  if (!text?.trim()) return text;
  return text
    .split('\n')
    .filter((line) => !isTypeInfoOnlyLine(line))
    .join('\n');
}
