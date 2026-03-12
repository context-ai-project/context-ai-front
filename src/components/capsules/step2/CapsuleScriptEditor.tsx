'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import {
  useCapsuleScript,
  useSetScript,
  useIsGeneratingScript,
  useGenerateScript,
} from '@/stores/capsule.store';
import { countWords, MAX_SCRIPT_WORDS } from '@/lib/utils/word-count';

export function CapsuleScriptEditor() {
  const t = useTranslations('capsules.wizard');
  const locale = useLocale();
  const script = useCapsuleScript();
  const setScript = useSetScript();
  const isGeneratingScript = useIsGeneratingScript();
  const generateScript = useGenerateScript();

  const wordCount = countWords(script);
  const isOverLimit = wordCount > MAX_SCRIPT_WORDS;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="capsule-script" className="text-foreground text-sm font-medium">
          {t('script')}
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => generateScript(locale)}
          disabled={isGeneratingScript}
        >
          {isGeneratingScript ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('generatingScript')}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {t('generateScript')}
            </>
          )}
        </Button>
      </div>
      <Textarea
        id="capsule-script"
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder={t('scriptPlaceholder')}
        rows={14}
        className={`resize-none font-mono text-sm ${isOverLimit ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        disabled={isGeneratingScript}
      />
      <div className="flex items-center justify-between">
        <p
          className={`text-xs ${isOverLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
        >
          {wordCount} / {MAX_SCRIPT_WORDS} {t('words')}
        </p>
        {isOverLimit && (
          <p className="text-destructive text-xs font-medium">{t('scriptTooLong')}</p>
        )}
      </div>
    </div>
  );
}
