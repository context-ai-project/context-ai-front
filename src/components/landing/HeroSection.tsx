import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Hero section for landing page
 * Large heading with gradient, subtitle, CTA buttons, and stats
 */
export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20">
      {/* Background glow */}
      <div className="bg-primary/5 pointer-events-none absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="bg-primary/5 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
          <Sparkles className="h-4 w-4" />
          {t('badge')}
        </div>

        <h1 className="text-foreground mb-6 text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
          {t('title.part1')}
          <br />
          <span className="text-primary">{t('title.part2')}</span>
        </h1>

        <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-pretty md:text-xl">
          {t('subtitle')}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link href="/auth/signin">
              {t('cta.primary')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent px-8" asChild>
            <Link href="/auth/signin">{t('cta.secondary')}</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="border-border mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t pt-10">
          <div>
            <div className="text-foreground text-3xl font-bold">{t('stats.resolution.value')}</div>
            <div className="text-muted-foreground mt-1 text-sm">{t('stats.resolution.label')}</div>
          </div>
          <div>
            <div className="text-foreground text-3xl font-bold">{t('stats.onboarding.value')}</div>
            <div className="text-muted-foreground mt-1 text-sm">{t('stats.onboarding.label')}</div>
          </div>
          <div>
            <div className="text-foreground text-3xl font-bold">{t('stats.questions.value')}</div>
            <div className="text-muted-foreground mt-1 text-sm">{t('stats.questions.label')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
