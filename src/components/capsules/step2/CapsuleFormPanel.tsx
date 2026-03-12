'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2, Headphones, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CapsuleScriptEditor } from './CapsuleScriptEditor';
import { CapsuleVoiceSelect } from './CapsuleVoiceSelect';
import {
  useIntroText,
  useSetIntroText,
  useSelectedVoiceId,
  useCapsuleScript,
  useIsGeneratingAudio,
  useIsCreating,
  usePreviousStep,
  useGenerateAudio,
  useSelectedDocumentIds,
  useCapsuleType,
} from '@/stores/capsule.store';
import { countWords, MAX_SCRIPT_WORDS } from '@/lib/utils/word-count';

interface CapsuleFormPanelProps {
  /**
   * Override the default "go to Step 1" back behaviour.
   * Used by the Resume wizard to navigate back to the capsule detail page
   * instead of returning to the create wizard's Step 1.
   */
  onBack?: () => void;
}

export function CapsuleFormPanel({ onBack }: CapsuleFormPanelProps = {}) {
  const t = useTranslations('capsules.wizard');
  const introText = useIntroText();
  const setIntroText = useSetIntroText();
  const selectedVoiceId = useSelectedVoiceId();
  const script = useCapsuleScript();
  const isGeneratingAudio = useIsGeneratingAudio();
  const isCreating = useIsCreating();
  const previousStep = usePreviousStep();
  const generateAudio = useGenerateAudio();
  const selectedDocumentIds = useSelectedDocumentIds();
  const capsuleType = useCapsuleType();

  const isVideo = capsuleType === 'VIDEO';
  const handleBack = onBack ?? previousStep;

  const scriptOverLimit = countWords(script) > MAX_SCRIPT_WORDS;
  const canGenerateAudio =
    !!selectedVoiceId && script.trim().length > 0 && !isGeneratingAudio && !scriptOverLimit;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      {/* Selected documents chips */}
      {selectedDocumentIds.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            {t('documentsSelected')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedDocumentIds.map((id) => (
              <span
                key={id}
                className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 font-mono text-xs"
              >
                {id.slice(0, 8)}…
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Intro text */}
      <div>
        <label htmlFor="intro-text" className="text-foreground mb-2 block text-sm font-medium">
          {t('introText')}
        </label>
        <Textarea
          id="intro-text"
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          placeholder={t('introPlaceholder')}
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Script editor with generate button */}
      <CapsuleScriptEditor />

      {/* Voice selection */}
      <CapsuleVoiceSelect />

      {/* Action buttons */}
      <div className="mt-auto flex items-center justify-between pt-4">
        <Button type="button" variant="outline" onClick={handleBack} disabled={isGeneratingAudio}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('previous')}
        </Button>

        <Button type="button" onClick={generateAudio} disabled={!canGenerateAudio || isCreating}>
          {isGeneratingAudio ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isVideo ? t('generatingVideo') : t('generatingAudio')}
            </>
          ) : (
            <>
              {isVideo ? (
                <Video className="mr-2 h-4 w-4" />
              ) : (
                <Headphones className="mr-2 h-4 w-4" />
              )}
              {isVideo ? t('generateVideo') : t('generateAudio')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
