'use client';

import Link from 'next/link';
import { Brain, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserAvatar } from './UserAvatar';
import { LanguageSelector } from './LanguageSelector';
import { SectorSelector } from '@/components/user/SectorSelector';
import { LogoutButton } from '@/components/user/LogoutButton';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Navigation bar component with user profile and sector selection
 * Updated for Issue 5.13: User Profile and Session Management
 */
export function Navbar() {
  const locale = useLocale();
  const { user, isLoading, userName, userEmail, userPicture } = useCurrentUser();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-3">
            <Brain className="text-primary h-8 w-8" />
            <Link href={routes.home(locale)} className="text-xl font-semibold text-gray-900">
              Context.ai
            </Link>
          </div>

          {/* Navigation links - desktop */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href={routes.dashboard(locale)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href={routes.chat(locale)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Chat
            </Link>
            <Link
              href={routes.knowledge(locale)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Knowledge
            </Link>
          </div>

          {/* User info and sector selector */}
          <div className="flex items-center gap-4">
            {/* Language Selector - Always visible */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {isLoading && (
              <div
                data-testid="loading-skeleton"
                className="h-10 w-10 animate-pulse rounded-full bg-gray-200"
              />
            )}

            {!isLoading && !user && (
              <Button asChild>
                <Link href={routes.signIn(locale)}>Sign In</Link>
              </Button>
            )}

            {!isLoading && user && (
              <>
                {/* Sector Selector */}
                <div className="hidden lg:block">
                  <SectorSelector />
                </div>

                {/* User Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <UserAvatar src={userPicture} alt={userName} />
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-muted-foreground text-xs">{userEmail}</p>
                      </div>
                      <ChevronDown className="hidden h-4 w-4 sm:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm leading-none font-medium">{userName}</p>
                        <p className="text-muted-foreground text-xs leading-none">{userEmail}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Mobile language selector */}
                    <div className="px-2 py-2 sm:hidden">
                      <LanguageSelector />
                    </div>
                    <DropdownMenuSeparator className="sm:hidden" />

                    {/* Mobile sector selector */}
                    <div className="px-2 py-2 lg:hidden">
                      <SectorSelector />
                    </div>
                    <DropdownMenuSeparator className="lg:hidden" />

                    <DropdownMenuItem asChild>
                      <Link href={routes.profile(locale)} className="w-full cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={routes.settings(locale)} className="w-full cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <LogoutButton variant="ghost" size="sm" showLabel={true} />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
