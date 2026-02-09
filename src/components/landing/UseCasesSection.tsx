import { UserPlus, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

const useCaseIcons: Record<string, LucideIcon> = {
  onboarding: UserPlus,
  retention: BookOpen,
  crossFunctional: Users,
  quality: TrendingUp,
};

/**
 * Use cases section for landing page
 * 2-column grid with real startup challenges addressed by the platform
 */
export function UseCasesSection() {
  const t = useTranslations('landing.useCases');

  const useCaseKeys = ['onboarding', 'retention', 'crossFunctional', 'quality'] as const;

  return (
    <section id="use-cases" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold text-balance md:text-4xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-pretty">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {useCaseKeys.map((key) => {
            const Icon = useCaseIcons[key];
            return (
              <div key={key} className="bg-card border-border flex gap-5 rounded-xl border p-6">
                <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="text-primary h-6 w-6" />
                </div>
                <div>
                  <span className="text-primary text-xs font-medium tracking-wider uppercase">
                    {t(`items.${key}.persona`)}
                  </span>
                  <h3 className="text-foreground mt-1 mb-2 text-lg font-semibold">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
