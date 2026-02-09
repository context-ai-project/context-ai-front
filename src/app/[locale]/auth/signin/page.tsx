'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

/**
 * Sign in page using NextAuth.js v5
 * Redirects to Auth0 for authentication
 */
export default function SignInPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/dashboard`;

  const handleSignIn = () => {
    signIn('auth0', { callbackUrl });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Brain className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Context.ai</CardTitle>
          <CardDescription>
            Sign in to your account to access your knowledge management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} className="w-full" size="lg">
            Sign In with Auth0
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
