'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCurrentStep } from '@/stores/capsule.store';

function stepCircleClass(currentStep: number, step: number): string {
  if (currentStep === step) return 'bg-primary text-primary-foreground';
  if (currentStep > step) return 'bg-primary/20 text-primary';
  return 'bg-muted text-muted-foreground';
}

export function CapsuleStepIndicator() {
  const t = useTranslations('capsules.wizard');
  const currentStep = useCurrentStep();

  const steps = [
    { step: 1 as const, label: t('step1Title') },
    { step: 2 as const, label: t('step2Title') },
  ];

  return (
    <nav aria-label="Wizard steps" className="flex items-center gap-0">
      {steps.map(({ step, label }, index) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                stepCircleClass(currentStep, step),
              )}
            >
              {step}
            </div>
            <span
              className={cn(
                'text-sm font-medium',
                currentStep === step ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'mx-3 h-px w-12 transition-colors',
                currentStep > step ? 'bg-primary' : 'bg-border',
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
