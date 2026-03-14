/**
 * Centralized logger that only outputs in development mode.
 *
 * Replaces scattered console.warn/console.error calls in production code (CS-12).
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    if (isDev) console.error(...args);
  },
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args);
  },
};
