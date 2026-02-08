import { Navbar } from '@/components/shared/Navbar';

/**
 * Protected layout - requires authentication
 * Authentication is handled by middleware.ts
 * This layout just provides the structure for protected pages
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
