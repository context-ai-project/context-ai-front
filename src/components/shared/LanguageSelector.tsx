'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
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
 * Updates the URL with the selected locale and reloads the page content
 */
export function LanguageSelector() {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    // Replace current locale in pathname with new locale
    const segments = pathname.split('/');
    segments[1] = newLocale; // Assuming pathname starts with /[locale]/...
    const newPathname = segments.join('/');

    startTransition(() => {
      router.replace(newPathname);
    });
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
