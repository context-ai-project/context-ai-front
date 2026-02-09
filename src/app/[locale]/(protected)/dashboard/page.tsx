import { FileText, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

/**
 * Dashboard overview page
 * Shows key metrics and statistics for the knowledge platform
 * Server Component for better performance
 */
export default function DashboardPage() {
  const t = useTranslations('dashboard');

  // Mock stats for MVP - will be replaced with real API calls
  const stats = [
    {
      title: t('stats.queries.title'),
      value: '1,247',
      change: t('stats.queries.change'),
      icon: MessageSquare,
    },
    {
      title: t('stats.documents.title'),
      value: '156',
      change: t('stats.documents.change'),
      icon: FileText,
    },
    {
      title: t('stats.users.title'),
      value: '24',
      change: t('stats.users.change'),
      icon: Users,
    },
    {
      title: t('stats.accuracy.title'),
      value: '92%',
      change: t('stats.accuracy.change'),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-muted-foreground text-sm">{stat.title}</p>
                    <p className="text-foreground mt-1 text-3xl font-bold">{stat.value}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{stat.change}</p>
                  </div>
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for future sections */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-foreground mb-2 text-lg font-semibold">{t('comingSoon.title')}</h3>
          <p className="text-muted-foreground text-sm">{t('comingSoon.description')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
