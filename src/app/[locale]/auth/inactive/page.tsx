'use client';

import { useTranslations } from 'next-intl';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogout } from '@/hooks/useLogout';

/**
 * Inactive account page
 *
 * Shown when a user with `isActive: false` attempts to access the protected area.
 * Offers a logout button so the user can sign in with a different account.
 */
export default function InactiveAccountPage() {
  const t = useTranslations('auth.inactive');
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <ShieldOff className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-center text-sm">{t('contact')}</p>
          <Button onClick={logout} disabled={isLoggingOut} variant="outline" className="w-full">
            {isLoggingOut ? t('loggingOut') : t('logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
