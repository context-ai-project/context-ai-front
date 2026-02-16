/**
 * Suggested question translation keys organized by sector name.
 * These keys map to entries in messages/{locale}.json under "suggestedQuestions".
 *
 * Keys are **normalized sector names** (lowercase) so the mapping is
 * independent of backend-generated UUIDs and resilient to ID changes.
 */
export const SUGGESTED_QUESTION_KEYS: Record<string, string[]> = {
  // Human Resources sector
  'human resources': ['hr.vacationPolicy', 'hr.expenseReport', 'hr.benefits', 'hr.timeOff'],

  // Engineering sector
  engineering: [
    'engineering.codeReview',
    'engineering.cicd',
    'engineering.standards',
    'engineering.devSetup',
  ],

  // Sales sector
  sales: ['sales.pricing', 'sales.qualifyLead', 'sales.targets', 'sales.proposal'],

  // Default questions (fallback when sector has no specific questions)
  default: ['default.helpFind', 'default.howItWorks', 'default.documents', 'default.summarize'],
};

/**
 * Normalizes a sector name for use as a lookup key.
 *
 * @param name - The sector name (e.g. "Human Resources", "Engineering")
 * @returns A lowercase, trimmed string suitable for SUGGESTED_QUESTION_KEYS lookup
 */
export function normalizeSectorName(name: string): string {
  return name.toLowerCase().trim();
}
