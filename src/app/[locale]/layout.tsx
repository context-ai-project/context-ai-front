import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { QueryProvider } from '@/lib/providers/query-provider';
import { Toaster } from '@/components/ui/toaster';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Context.ai - RAG Knowledge Management',
  description: 'Sistema de gestión de conocimiento con búsqueda semántica y chat inteligente',
  keywords: ['RAG', 'AI', 'Knowledge Management', 'Chat', 'Semantic Search'],
};

const locales = ['en', 'es'];

/**
 * Locale Layout
 *
 * This layout wraps all pages within a specific locale.
 * It provides:
 * - NextIntl internationalization
 * - NextAuth session management
 * - TanStack Query provider
 * - Toast notifications
 */
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Await params (Next.js 15+ requirement)
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Load messages for the locale - pass locale explicitly
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SessionProvider>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </SessionProvider>
    </NextIntlClientProvider>
  );
}
