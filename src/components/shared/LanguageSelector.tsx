'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    setIsPending(true);

    // Replace current locale in pathname with new locale
    const segments = pathname.split('/').filter(Boolean); // Remove empty segments

    // Check if first segment is a locale
    if (segments.length > 0 && locales.includes(segments[0] as (typeof locales)[number])) {
      segments[0] = newLocale;
    } else {
      // If no locale in path, prepend it
      segments.unshift(newLocale);
    }

    const newPathname = '/' + segments.join('/');

    // Use window.location for a full page reload
    // This ensures the server re-fetches all messages for the new locale
    window.location.href = newPathname;
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
