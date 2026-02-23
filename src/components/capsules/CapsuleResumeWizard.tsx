'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CapsuleStepIndicator } from './CapsuleStepIndicator';
import { CapsuleFormPanel } from './step2/CapsuleFormPanel';
import { CapsulePreviewPanel } from './step2/CapsulePreviewPanel';
import { capsuleApi } from '@/lib/api/capsule.api';
import { useResumeWizard } from '@/stores/capsule.store';
import { routes } from '@/lib/routes';

interface CapsuleResumeWizardProps {
  capsuleId: string;
  locale: string;
}

/**
 * Resume wizard — loads an existing DRAFT or FAILED capsule and drops the user
 * directly into Step 2 (script + audio generation) with all fields pre-populated.
 */
export function CapsuleResumeWizard({ capsuleId, locale }: CapsuleResumeWizardProps) {
  const t = useTranslations('capsules');
  const router = useRouter();
  const resumeWizard = useResumeWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // "Back" in the resume wizard goes to the capsule detail page, not to Step 1
  const handleBack = useCallback(() => {
    router.push(routes.capsuleDetail(locale, capsuleId));
  }, [router, locale, capsuleId]);

  useEffect(() => {
    capsuleApi
      .getCapsule(capsuleId)
      .then((capsule) => {
        resumeWizard(capsule);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load capsule.');
        setIsLoading(false);
      });
  }, [capsuleId, resumeWizard]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive text-sm">{loadError}</p>
        <Link href={routes.capsules(locale)}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('list.title')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with stepper — shows step 2 active */}
      <div className="border-border border-b px-6 py-4">
        <h1 className="text-foreground mb-4 text-xl font-bold">{t('wizard.step2Title')}</h1>
        <CapsuleStepIndicator />
      </div>

      {/* Step 2 split panel — same as create wizard, but Back navigates to the detail page */}
      <div className="grid flex-1 grid-cols-2 divide-x overflow-hidden">
        <CapsuleFormPanel onBack={handleBack} />
        <CapsulePreviewPanel />
      </div>
    </div>
  );
}
