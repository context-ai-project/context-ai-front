import { Navbar } from '@/components/shared/Navbar';
import { ChatStoreProvider } from '@/stores/chat.store';
import { UserStoreProvider } from '@/stores/user.store';

/**
 * Protected layout - requires authentication
 * Authentication is handled by middleware.ts
 * This layout provides the structure and state management for protected pages
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserStoreProvider>
      <ChatStoreProvider>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1 p-4">{children}</main>
        </div>
      </ChatStoreProvider>
    </UserStoreProvider>
  );
}
