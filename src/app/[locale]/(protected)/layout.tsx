import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ChatStoreProvider } from '@/stores/chat.store';
import { UserStoreProvider } from '@/stores/user.store';
import { SectorStoreProvider } from '@/stores/sector.store';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { isE2ETestMode } from '@/lib/test-auth';
import { routes } from '@/lib/routes';

/**
 * Force dynamic rendering to ensure locale changes are reflected
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Protected layout with sidebar navigation
 * Authentication is checked here at the layout level
 * This layout provides the structure and state management for protected pages
 */
export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params to get the locale
  const { locale } = await params;

  // Check authentication (with E2E test bypass)
  if (!isE2ETestMode()) {
    // Normal authentication flow
    const session = await auth();
    if (!session) {
      redirect(routes.signIn(locale));
    }
  }
  // E2E test mode: bypass authentication

  // Use locale as key to force re-mount when language changes
  return (
    <UserStoreProvider key={locale}>
      <ChatStoreProvider>
        <SectorStoreProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="border-border flex h-14 items-center justify-between gap-3 border-b px-6">
                <SidebarTrigger />
                <LanguageSelector />
              </header>
              <main className="relative flex-1 overflow-auto">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </SectorStoreProvider>
      </ChatStoreProvider>
    </UserStoreProvider>
  );
}
