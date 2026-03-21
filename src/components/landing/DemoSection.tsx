'use client';

import { useTranslations } from 'next-intl';

const DEMOS = [
  {
    key: 'rag',
    url: 'https://www.loom.com/embed/2f0c6a408e734ac19374d3c63834d4bf?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true',
  },
  {
    key: 'capsule',
    url: 'https://www.loom.com/embed/a851a45273f74dd6b6f3d71a5e5c063a?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true',
  },
] as const;

function LaptopMockup({ src, title }: { src: string; title: string }) {
  return (
    <div className="w-full select-none">
      {/* Screen lid */}
      <div className="relative rounded-t-2xl bg-zinc-800 px-3 pt-5 pb-2 shadow-2xl ring-1 ring-zinc-700">
        {/* Webcam dot */}
        <div className="absolute top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-zinc-600 ring-1 ring-zinc-500" />

        {/* Screen bezel inner glow */}
        <div className="overflow-hidden rounded-sm bg-zinc-950 shadow-inner ring-1 ring-zinc-900">
          {/* Aspect ratio wrapper — 16:10 like modern MacBooks */}
          <div className="relative aspect-[16/10] w-full">
            <iframe
              src={src}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </div>

      {/* Hinge line */}
      <div className="h-px w-full bg-zinc-600" />

      {/* Keyboard base */}
      <div className="relative h-6 rounded-b-xl bg-gradient-to-b from-zinc-700 to-zinc-800 shadow-lg ring-1 ring-zinc-600">
        {/* Trackpad */}
        <div className="absolute top-1.5 left-1/2 h-2.5 w-14 -translate-x-1/2 rounded-sm bg-zinc-600/60 ring-1 ring-zinc-500/40" />
      </div>

      {/* Bottom foot shadow */}
      <div className="mx-auto h-1 w-[96%] rounded-b-lg bg-black/20 shadow-sm" />
    </div>
  );
}

/**
 * Demo section for landing page
 * Two Loom videos embedded inside laptop mockups
 */
export function DemoSection() {
  const t = useTranslations('landing.demo');

  return (
    <section id="demo" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold text-balance md:text-4xl">
            {t('title')}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-pretty">{t('subtitle')}</p>
        </div>

        <div className="grid gap-16 lg:grid-cols-2">
          {DEMOS.map(({ key, url }) => (
            <div key={key} className="flex flex-col items-center gap-6">
              <div className="w-full max-w-lg">
                <LaptopMockup src={url} title={t(`items.${key}.title`)} />
              </div>
              <div className="text-center">
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
