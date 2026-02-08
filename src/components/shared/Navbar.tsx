'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { MessageSquare, Menu } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

/**
 * Navigation bar component with user information
 * Displays user avatar, name, and navigation links
 */
export function Navbar() {
  const { user, isLoading } = useUser();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-blue-600" />
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Context.AI
            </Link>
          </div>

          {/* Navigation links - desktop */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/chat" className="text-gray-700 hover:text-gray-900">
              Chat
            </Link>
            <Link href="/knowledge" className="text-gray-700 hover:text-gray-900">
              Knowledge
            </Link>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            {isLoading && <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />}

            {!isLoading && !user && (
              <Link
                href="/api/auth/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign In
              </Link>
            )}

            {!isLoading && user && (
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <UserAvatar user={user} />
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
