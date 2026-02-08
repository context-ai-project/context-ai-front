/**
 * Suggested questions organized by sector.
 * These questions are displayed in the EmptyState to help users get started.
 */
export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  // Human Resources sector
  '440e8400-e29b-41d4-a716-446655440000': [
    'What is the company vacation policy?',
    'How do I submit an expense report?',
    'What are the employee benefits?',
    'How can I request time off?',
  ],

  // Engineering sector
  '440e8400-e29b-41d4-a716-446655440001': [
    'What is our code review process?',
    'How do we handle CI/CD deployments?',
    'What are the coding standards?',
    'How do I set up my development environment?',
  ],

  // Sales sector
  '440e8400-e29b-41d4-a716-446655440002': [
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
