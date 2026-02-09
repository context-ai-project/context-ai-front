import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ChatStoreProvider } from '@/stores/chat.store';
import { UserStoreProvider } from '@/stores/user.store';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

/**
 * Protected layout with sidebar navigation
 * Authentication is handled by middleware.ts
 * This layout provides the structure and state management for protected pages
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserStoreProvider>
      <ChatStoreProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="border-border flex h-14 items-center justify-between gap-3 border-b px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
              </div>
              <LanguageSelector />
            </header>
            <div className="flex flex-1 flex-col overflow-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </ChatStoreProvider>
    </UserStoreProvider>
  );
}
