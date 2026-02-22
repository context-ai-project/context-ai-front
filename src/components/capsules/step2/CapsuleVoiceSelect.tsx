'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCapsuleVoices,
  useSelectedVoiceId,
  useSetSelectedVoiceId,
  useIsLoadingVoices,
  useLoadVoices,
} from '@/stores/capsule.store';

export function CapsuleVoiceSelect() {
  const t = useTranslations('capsules.wizard');
  const voices = useCapsuleVoices();
  const selectedVoiceId = useSelectedVoiceId();
  const setSelectedVoiceId = useSetSelectedVoiceId();
  const isLoadingVoices = useIsLoadingVoices();
  const loadVoices = useLoadVoices();

  useEffect(() => {
    if (voices.length === 0) {
      loadVoices();
    }
  }, [voices.length, loadVoices]);

  return (
    <div>
      <label className="text-foreground mb-2 block text-sm font-medium">{t('selectVoice')}</label>
      <Select
        value={selectedVoiceId ?? ''}
        onValueChange={setSelectedVoiceId}
        disabled={isLoadingVoices || voices.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={isLoadingVoices ? 'Loading voices…' : t('selectVoice')} />
        </SelectTrigger>
        <SelectContent>
          {voices.map((voice) => (
            <SelectItem key={voice.voiceId} value={voice.voiceId}>
              {voice.name}
              {voice.category ? ` — ${voice.category}` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
