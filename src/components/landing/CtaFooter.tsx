'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { routes } from '@/lib/routes';

/**
 * CTA section for landing page
 * Final call-to-action before footer
 */
export function CTASection() {
  const t = useTranslations('landing.cta');
  const locale = useLocale();

  return (
    <section className="bg-muted/50 border-border border-t px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-foreground mb-4 text-3xl font-bold text-balance md:text-4xl">
          {t('title')}
        </h2>
        <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-pretty">{t('subtitle')}</p>
        <Button size="lg" className="gap-2 px-8" asChild>
          <Link href={routes.signIn(locale)}>
            {t('button')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/**
 * Footer component for landing page
 * Logo, navigation links, and copyright information
 */
export function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="border-border border-t px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md">
            <Brain className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="text-foreground text-sm font-semibold">Context.ai</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground text-sm">
            {t('links.features')}
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground text-sm">
            {t('links.howItWorks')}
          </a>
          <a href="#use-cases" className="text-muted-foreground hover:text-foreground text-sm">
            {t('links.useCases')}
          </a>
        </div>
        <p className="text-muted-foreground text-xs">{t('copyright')}</p>
      </div>
    </footer>
  );
}
