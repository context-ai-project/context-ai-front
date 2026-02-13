import { SECTORS } from './sectors';

/**
 * Suggested questions organized by sector.
 * These questions are displayed in the EmptyState to help users get started.
 *
 * Uses centralized sector IDs from constants/sectors.ts
 */
export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  // Human Resources sector
  [SECTORS[0].id]: [
    'What is the company vacation policy?',
    'How do I submit an expense report?',
    'What are the employee benefits?',
    'How can I request time off?',
  ],

  // Engineering sector
  [SECTORS[1].id]: [
    'What is our code review process?',
    'How do we handle CI/CD deployments?',
    'What are the coding standards?',
    'How do I set up my development environment?',
  ],

  // Sales sector
  [SECTORS[2].id]: [
    'What is our pricing strategy?',
    'How do I qualify a lead?',
    'What are the sales targets for this quarter?',
    'How do I create a sales proposal?',
  ],

  // Default questions (fallback)
  default: [
    'What information can you help me find?',
    'How does this system work?',
    'What documents do you have access to?',
    'Can you summarize recent updates?',
  ],
};
