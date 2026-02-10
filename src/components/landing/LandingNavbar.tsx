'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

/**
 * Landing page navigation bar
 * Fixed header with blur backdrop, logo, navigation links, and auth buttons
 */
export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations('landing.nav');
  const locale = useLocale();

  return (
    <header className="bg-background/80 border-border/50 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Brain className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-foreground text-lg font-bold">Context.ai</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t('features')}
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t('howItWorks')}
          </a>
          <a
            href="#use-cases"
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            {t('useCases')}
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSelector />
          <Button variant="ghost" asChild>
            <Link href={`/${locale}/auth/signin`}>{t('signIn')}</Link>
          </Button>
          <Button asChild>
            <Link href={`/${locale}/auth/signin`}>{t('getStarted')}</Link>
          </Button>
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="bg-background border-border border-t px-6 pt-4 pb-6 md:hidden">
          <nav className="flex flex-col gap-4">
            <a
              href="#features"
              className="text-muted-foreground text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {t('features')}
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {t('howItWorks')}
            </a>
            <a
              href="#use-cases"
              className="text-muted-foreground text-sm"
              onClick={() => setMobileOpen(false)}
            >
              {t('useCases')}
            </a>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <LanguageSelector />
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/auth/signin`}>{t('signIn')}</Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}/auth/signin`}>{t('getStarted')}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
