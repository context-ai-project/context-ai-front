'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CapsuleStepIndicator } from './CapsuleStepIndicator';
import { CapsuleTypeSelector } from './step1/CapsuleTypeSelector';
import { CapsuleSectorSelect } from './step1/CapsuleSectorSelect';
import { CapsuleTitleInput } from './step1/CapsuleTitleInput';
import { CapsuleDocumentList } from './step1/CapsuleDocumentList';
import { CapsuleFormPanel } from './step2/CapsuleFormPanel';
import { CapsulePreviewPanel } from './step2/CapsulePreviewPanel';
import {
  useCurrentStep,
  useSelectedSectorId,
  useCapsuleTitle,
  useSelectedDocumentIds,
  useIsCreating,
  useCapsuleError,
  useNextStep,
} from '@/stores/capsule.store';

export function CapsuleCreateWizard() {
  const t = useTranslations('capsules.wizard');
  const currentStep = useCurrentStep();
  const selectedSectorId = useSelectedSectorId();
  const capsuleTitle = useCapsuleTitle();
  const selectedDocumentIds = useSelectedDocumentIds();
  const isCreating = useIsCreating();
  const error = useCapsuleError();
  const nextStep = useNextStep();

  const canProceedToStep2 =
    !!selectedSectorId && capsuleTitle.trim().length > 0 && selectedDocumentIds.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header with stepper */}
      <div className="border-border border-b px-6 py-4">
        <h1 className="text-foreground mb-4 text-xl font-bold">{t('step1Title')}</h1>
        <CapsuleStepIndicator />
      </div>

      {/* Step content */}
      {currentStep === 1 ? (
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <CapsuleTypeSelector />
          <CapsuleSectorSelect />
          <CapsuleTitleInput />
          <CapsuleDocumentList />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="mt-auto flex justify-end pt-4">
            <Button type="button" onClick={nextStep} disabled={!canProceedToStep2 || isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  {t('next')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 divide-x overflow-hidden">
          <CapsuleFormPanel />
          <CapsulePreviewPanel />
        </div>
      )}
    </div>
  );
}
