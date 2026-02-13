/**
 * Get user initials from a display name
 *
 * @param name - The user's display name
 * @param maxChars - Maximum number of initials to return (default: 2)
 * @returns Uppercase initials string, or 'U' as fallback
 *
 * @example
 * getUserInitials('Gabriela Romero') // 'GR'
 * getUserInitials('John')            // 'J'
 * getUserInitials(null)              // 'U'
 * getUserInitials('A B C', 1)        // 'A'
 */
export function getUserInitials(name?: string | null, maxChars = 2): string {
  if (!name) return 'U';

  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, maxChars);
}
