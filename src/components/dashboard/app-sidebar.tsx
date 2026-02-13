'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, MessageSquare, LayoutDashboard, LogOut, ChevronUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useLogout } from '@/hooks/useLogout';
import { getUserInitials } from '@/lib/utils/get-user-initials';
import { routes } from '@/lib/routes';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Application sidebar component
 * Provides navigation and user menu for the dashboard
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = useLocale();
  const { logout } = useLogout();

  const mainNav = [
    {
      title: 'Dashboard',
      href: routes.dashboard(locale),
      icon: LayoutDashboard,
    },
    {
      title: 'AI Chat',
      href: routes.chat(locale),
      icon: MessageSquare,
    },
  ];

  /**
   * Get user role from session
   * Auth0 can send roles in custom claims, fallback to 'user' if not available
   */
  const getUserRole = (): string => {
    const roles = session?.user?.roles;
    if (roles && Array.isArray(roles) && roles.length > 0) {
      return roles[0];
    }
    return 'user';
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href={routes.chat(locale)} className="flex items-center gap-2.5">
          <div className="bg-sidebar-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Brain className="text-sidebar-primary-foreground h-5 w-5" />
          </div>
          <span className="text-sidebar-foreground text-base font-bold">Context.ai</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                {session?.user?.image && (
                  <AvatarImage src={session.user.image} alt={session.user.name ?? 'User'} />
                )}
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {getUserInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="text-sidebar-foreground truncate text-sm font-medium">
                  {session?.user?.name ?? 'User'}
                </div>
                <div className="text-sidebar-foreground/60 truncate text-xs">{getUserRole()}</div>
              </div>
              <ChevronUp className="text-sidebar-foreground/60 h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
