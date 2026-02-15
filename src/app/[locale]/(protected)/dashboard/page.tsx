import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

/**
 * Force dynamic rendering to ensure locale changes are reflected
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Dashboard overview page
 * Shows key metrics and statistics for the knowledge platform
 * Server Component for layout, delegates stats to DashboardStats (Client Component)
 */
export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  // Await params to get the locale
  const { locale } = await params;

  // Get translations for the specific locale
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Page header */}
      <div>
        <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
      </div>

      {/* Stats Grid — real data from APIs */}
      <DashboardStats />

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
