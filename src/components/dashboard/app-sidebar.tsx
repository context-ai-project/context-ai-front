'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Brain,
  MessageSquare,
  LayoutDashboard,
  FileText,
  LogOut,
  ChevronUp,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { useLogout } from '@/hooks/useLogout';
import { getUserInitials } from '@/lib/utils/get-user-initials';
import { getUserRole } from '@/lib/utils/get-user-role';
import {
  hasPermission,
  CAN_VIEW_DOCUMENTS,
  CAN_VIEW_SECTORS,
  CAN_VIEW_ADMIN,
} from '@/constants/permissions';
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
  const t = useTranslations('nav');

  const userRole = getUserRole(session?.user?.roles);

  const canViewDocuments = hasPermission(userRole, CAN_VIEW_DOCUMENTS);
  const canViewSectors = hasPermission(userRole, CAN_VIEW_SECTORS);
  const canViewAdmin = hasPermission(userRole, CAN_VIEW_ADMIN);

  const mainNav = [
    {
      title: t('dashboard'),
      href: routes.dashboard(locale),
      icon: LayoutDashboard,
    },
    {
      title: t('chat'),
      href: routes.chat(locale),
      icon: MessageSquare,
    },
    // Documents - all authenticated users (knowledge:read)
    ...(canViewDocuments
      ? [
          {
            title: t('documents'),
            href: routes.documents(locale),
            icon: FileText,
          },
        ]
      : []),
    // Sectors - admin only
    ...(canViewSectors
      ? [
          {
            title: t('sectors'),
            href: routes.sectors(locale),
            icon: Layers,
          },
        ]
      : []),
  ];

  /** Management section – visible only for admin role */
  const managementNav = [
    ...(canViewAdmin
      ? [
          {
            title: t('admin'),
            href: routes.admin(locale),
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

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
          <SidebarGroupLabel>{t('platform')}</SidebarGroupLabel>
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

        {managementNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('management')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementNav.map((item) => (
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
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-sidebar-accent flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors"
              aria-label={t('userMenu')}
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
                <div className="text-sidebar-foreground/60 truncate text-xs">{userRole}</div>
              </div>
              <ChevronUp className="text-sidebar-foreground/60 h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
