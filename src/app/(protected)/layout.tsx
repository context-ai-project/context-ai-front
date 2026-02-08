import { Navbar } from '@/components/shared/Navbar';
import { ChatStoreProvider } from '@/stores/chat.store';
import { UserStoreProvider } from '@/stores/user.store';

/**
 * Layout for authenticated pages that provides user and chat state and renders a navbar and content container.
 *
 * Authentication is enforced by middleware.ts; this component supplies UserStoreProvider and ChatStoreProvider
 * wrappers and the page structure for protected routes.
 *
 * @param children - The page content to render inside the protected layout's main area
 * @returns The React element that wraps protected pages with state providers and layout chrome
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