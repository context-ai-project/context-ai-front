'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, MessageSquare, LogOut, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';

/**
 * Application sidebar component
 * Provides navigation and user menu for the dashboard
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = useLocale();

  const mainNav = [
    {
      title: 'AI Chat',
      href: `/${locale}/chat`,
      icon: MessageSquare,
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` });
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get user role from session
   * Auth0 can send roles in custom claims, fallback to 'user' if not available
   */
  const getUserRole = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = (session as any)?.user?.roles;
    if (roles && Array.isArray(roles) && roles.length > 0) {
      return roles[0];
    }
    return 'user';
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border border-b p-4">
        <Link href={`/${locale}/chat`} className="flex items-center gap-2.5">
          <div className="bg-sidebar-primary flex h-9 w-9 items-center justify-center rounded-lg">
            <Brain className="text-sidebar-primary-foreground h-5 w-5" />
          </div>
          <span className="text-sidebar-foreground text-lg font-semibold tracking-tight">
            Context.ai
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 mb-2 px-2 text-xs font-medium tracking-wider uppercase">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent"
                  >
                    <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-9 w-9">
                {session?.user?.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name ?? 'User'} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {getUserInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col truncate">
                <div className="text-sidebar-foreground truncate text-sm font-medium">
                  {session?.user?.name ?? 'User'}
                </div>
                <div className="text-sidebar-foreground/50 truncate text-xs">{getUserRole()}</div>
              </div>
              <ChevronUp className="text-sidebar-foreground/60 h-4 w-4 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
