'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FileText, MessageSquare, Layers, Users, Brain } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { statsApi } from '@/lib/api/stats.api';
import type { AdminStatsDto } from '@/lib/api/stats.api';
import { logError } from '@/lib/api/error-handler';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, CAN_VIEW_ADMIN } from '@/constants/permissions';
import { routes } from '@/lib/routes';

// ── Types ────────────────────────────────────────────────────────────────────

interface DashboardStat {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** Number of stat cards to show as skeleton while loading */
const SKELETON_COUNT = 4;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a number for display (e.g. 1247 → "1,247") */
function formatNumber(n: number): string {
  return n.toLocaleString();
}

// ── Component ────────────────────────────────────────────────────────────────

/**
 * DashboardStats – role-aware dashboard content.
 *
 * - **Admin**: Fetches real platform-wide data from the admin stats API.
 * - **Non-admin**: Shows a welcome view with quick-access links to Chat and Documents.
 *
 * This prevents non-admin users from hitting the admin-only `GET /admin/stats`
 * endpoint and seeing empty/zero data.
 */
export function DashboardStats() {
  const { data: session } = useSession();
  const userRole = getUserRole(session?.user?.roles);
  const isAdmin = hasPermission(userRole, CAN_VIEW_ADMIN);

  if (isAdmin) {
    return <AdminStats />;
  }

  return <WelcomeView />;
}

// ── AdminStats (admin-only) ──────────────────────────────────────────────────

function AdminStats() {
  const t = useTranslations('dashboard');

  const [data, setData] = useState<AdminStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const stats = await statsApi.getAdminStats();
      setData(stats);
    } catch (err: unknown) {
      logError(err, { context: 'DashboardStats.fetchStats' });
      // Show zeros on error – better than showing nothing
      setData({
        totalConversations: 0,
        totalUsers: 0,
        recentUsers: 0,
        totalDocuments: 0,
        totalSectors: 0,
        activeSectors: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <Card key={`skeleton-${String(i)}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats: DashboardStat[] = [
    {
      title: t('stats.conversations.title'),
      value: formatNumber(data.totalConversations),
      subtitle: t('stats.conversations.subtitle'),
      icon: MessageSquare,
    },
    {
      title: t('stats.documents.title'),
      value: formatNumber(data.totalDocuments),
      subtitle: t('stats.documents.subtitle'),
      icon: FileText,
    },
    {
      title: t('stats.users.title'),
      value: formatNumber(data.totalUsers),
      subtitle: t('stats.users.subtitle', { recent: data.recentUsers }),
      icon: Users,
    },
    {
      title: t('stats.sectors.title'),
      value: formatNumber(data.totalSectors),
      subtitle: t('stats.sectors.subtitle', { active: data.activeSectors }),
      icon: Layers,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
}

// ── WelcomeView (non-admin) ──────────────────────────────────────────────────

/**
 * Welcome view for non-admin users (user / manager).
 * Shows quick-access links to Chat and Documents instead of admin-only stats.
 */
function WelcomeView() {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Welcome hero */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="from-primary to-primary/60 rounded-full bg-gradient-to-br p-5 shadow-lg">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('welcome.title')}</h2>
        <p className="max-w-md text-gray-600">{t('welcome.subtitle')}</p>
      </div>

      {/* Quick action cards */}
      <div className="grid w-full max-w-2xl gap-4 md:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('welcome.chatCta')}</h3>
              <p className="mt-1 text-sm text-gray-600">{t('welcome.chatDescription')}</p>
            </div>
            <Button asChild variant="default" className="w-full">
              <Link href={routes.chat(locale)}>{t('welcome.chatCta')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('welcome.documentsCta')}</h3>
              <p className="mt-1 text-sm text-gray-600">{t('welcome.documentsDescription')}</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={routes.documents(locale)}>{t('welcome.documentsCta')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground text-sm">{stat.title}</p>
            <p className="text-foreground mt-1 text-3xl font-bold">{stat.value}</p>
            <p className="text-muted-foreground mt-1 text-xs">{stat.subtitle}</p>
          </div>
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
            <Icon className="text-primary h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
