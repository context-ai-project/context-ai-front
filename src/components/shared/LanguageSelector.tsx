'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales } from '@/i18n';
import { Globe } from 'lucide-react';

/**
 * Language Selector Component
 *
 * Allows users to switch between available locales (English/Spanish)
 * Uses window.location for full page reload to ensure server re-fetches messages
 */
export function LanguageSelector() {
  const t = useTranslations('language');
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) {
      return;
    }

    setIsPending(true);

    // Get the full pathname from window.location (includes locale)
    const currentPath = window.location.pathname;

    // Split by / and replace the locale (always at index 1)
    const segments = currentPath.split('/');
    segments[1] = newLocale;

    const newPath = segments.join('/');

    // Force full page reload to ensure server re-fetches messages
    window.location.href = newPath;
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange} disabled={isPending}>
      <SelectTrigger className="h-9 w-[140px] gap-2">
        <Globe className="h-4 w-4 shrink-0" />
        <SelectValue placeholder={t('select')} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {t(loc)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
