import { Upload, Cpu, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

const stepIcons: Record<string, LucideIcon> = {
  upload: Upload,
  index: Cpu,
  answer: MessageCircle,
};

/**
 * How it works section for landing page
 * 3-step process with numbered steps and icons
 */
export function HowItWorksSection() {
  const t = useTranslations('landing.howItWorks');

  const stepKeys = ['upload', 'index', 'answer'] as const;

  return (
    <section id="how-it-works" className="bg-muted/50 border-border border-y px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold text-balance md:text-4xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-pretty">{t('subtitle')}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stepKeys.map((key, index) => {
            const Icon = stepIcons[key];
            const stepNumber = (index + 1).toString().padStart(2, '0');
            return (
              <div key={key} className="relative text-center">
                <div className="mb-6 inline-flex flex-col items-center">
                  <span className="text-primary mb-3 text-sm font-bold">{stepNumber}</span>
                  <div className="border-primary/20 bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl border">
                    <Icon className="text-primary h-7 w-7" />
                  </div>
                </div>
                <h3 className="text-foreground mb-3 text-xl font-semibold">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`steps.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
