/**
 * Accessibility testing setup for vitest-axe
 *
 * Imports matchers and extends Vitest's expect with toHaveNoViolations.
 * Also provides the `axe` runner for use in test files.
 */
import * as axeMatchers from 'vitest-axe/matchers';

// Extend Vitest matchers with the axe a11y matcher
expect.extend(axeMatchers);

// Re-export the axe runner for convenience
export { axe, configureAxe } from 'vitest-axe';

// Type augmentation so `.toHaveNoViolations()` is recognized by TS
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
