'use client';

import { Brain, FileText, MessageSquare, BarChart3, Shield, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';

const featureIcons: Record<string, LucideIcon> = {
  sectors: Layers,
  ingestion: FileText,
  qa: Brain,
  capsules: MessageSquare,
  analytics: BarChart3,
  access: Shield,
};

/**
 * Features section for landing page
 * 3-column grid with icons and feature descriptions
 */
export function FeaturesSection() {
  const t = useTranslations('landing.features');

  const featureKeys = ['sectors', 'ingestion', 'qa', 'capsules', 'analytics', 'access'] as const;

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold text-balance md:text-4xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-pretty">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const Icon = featureIcons[key];
            return (
              <div
                key={key}
                className="bg-card border-border hover:border-primary/30 hover:bg-accent/50 group rounded-xl border p-6 transition-colors"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
