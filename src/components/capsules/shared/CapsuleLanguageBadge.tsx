'use client';

interface CapsuleLanguageBadgeProps {
  language: string;
}

const LANGUAGE_MAP: Record<string, { flag: string; label: string }> = {
  es: { flag: '🇪🇸', label: 'ES' },
  en: { flag: '🇬🇧', label: 'EN' },
};

function getLanguageDisplay(language: string): { flag: string; label: string } {
  const prefix = language.toLowerCase().slice(0, 2);
  return LANGUAGE_MAP[prefix] ?? { flag: '🌐', label: language.slice(0, 5).toUpperCase() };
}

export function CapsuleLanguageBadge({ language }: CapsuleLanguageBadgeProps) {
  const { flag, label } = getLanguageDisplay(language);

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium"
      title={language}
    >
      <span aria-hidden="true">{flag}</span>
      {label}
    </span>
  );
}
