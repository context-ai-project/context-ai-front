'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, FileCode, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { KnowledgeSourceDto, KnowledgeSourceDetailDto } from '@/lib/api/knowledge.api';
import { SECTORS } from '@/constants/sectors';

/** Type icon mapping */
type IconComponent = typeof FileText;
const TYPE_ICONS: Record<string, IconComponent> = {
  PDF: FileText,
  MARKDOWN: FileCode,
  TEXT: FileText,
  URL: LinkIcon,
};

/** Badge variant mapping for document status */
type BadgeVariant = 'default' | 'secondary' | 'destructive';
const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  PROCESSED: 'default',
  COMPLETED: 'default',
  PROCESSING: 'secondary',
  PENDING: 'secondary',
  FAILED: 'destructive',
};

/** Maximum content length shown before truncation */
const MAX_PREVIEW_CHARS = 5000;

interface DocumentDetailDialogProps {
  document: KnowledgeSourceDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * DocumentDetailDialog
 * Shows the full detail of a knowledge source including its content preview.
 */
export function DocumentDetailDialog({ document, open, onOpenChange }: DocumentDetailDialogProps) {
  const t = useTranslations('documents');

  const [detail, setDetail] = useState<KnowledgeSourceDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDetail = useCallback(
    async (docId: string) => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await knowledgeApi.getDocumentDetail(docId);
        setDetail(data);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : t('errorLoadingDetail'));
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (open && document) {
      void loadDetail(document.id);
    }
    if (!open) {
      setDetail(null);
      setLoadError(null);
    }
  }, [open, document, loadDetail]);

  if (!document) return null;

  const TypeIcon = TYPE_ICONS[document.sourceType] ?? FileText;
  const badgeVariant = STATUS_BADGE_VARIANTS[document.status] ?? 'secondary';
  const sectorName = SECTORS.find((s) => s.id === document.sectorId)?.name ?? 'Unknown';

  const rawContent = detail?.content ?? null;
  const contentPreview =
    rawContent && rawContent.length > MAX_PREVIEW_CHARS
      ? rawContent.slice(0, MAX_PREVIEW_CHARS) + '…'
      : rawContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <TypeIcon className="text-muted-foreground h-5 w-5" />
            </div>
            <span className="truncate">{document.title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-sm">
          <Badge variant={badgeVariant}>{t(`status.${document.status}`)}</Badge>
          <span className="text-muted-foreground">
            {t('sector')}: <strong>{sectorName}</strong>
          </span>
          <span className="text-muted-foreground">
            {t('type')}: <strong>{t(`sourceType.${document.sourceType}`)}</strong>
          </span>
          {detail && (
            <span className="text-muted-foreground">
              {t('fragments')}: <strong>{detail.fragmentCount}</strong>
            </span>
          )}
          <span className="text-muted-foreground">
            {t('createdAt')}:{' '}
            <strong>
              {new Date(document.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </strong>
          </span>
        </div>

        {/* Content area */}
        <div className="mt-2">
          <h4 className="mb-2 text-sm font-medium">{t('documentContent')}</h4>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <span className="text-muted-foreground text-sm">{t('loadingDetail')}</span>
            </div>
          )}

          {loadError && !isLoading && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          {!isLoading && !loadError && contentPreview && (
            <ScrollArea className="h-[350px] rounded-md border p-4">
              <pre className="font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
                {contentPreview}
              </pre>
            </ScrollArea>
          )}

          {!isLoading && !loadError && !contentPreview && (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('noContent')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
