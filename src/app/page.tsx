import { redirect } from 'next/navigation';

/**
 * Root page - redirects to the default locale
 * This handles visits to the root URL (/) and redirects to the localized version
 */
export default function RootPage(): never {
  // Redirect to default locale (Spanish)
  redirect('/es');
}
