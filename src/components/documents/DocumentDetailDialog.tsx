'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  FileText,
  Loader2,
  AlertCircle,
  Calendar,
  Layers,
  FolderOpen,
  FileType,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { KnowledgeSourceDto, KnowledgeSourceDetailDto } from '@/lib/api/knowledge.api';
import { useAllSectors } from '@/stores/sector.store';
import { TYPE_ICONS, STATUS_BADGE_VARIANTS } from '@/constants/document-mappings';
import { formatDate } from '@/lib/utils/format-date';

/** Maximum content length shown before truncation */
const MAX_PREVIEW_CHARS = 8000;

/** Minimum line length to trigger paragraph splitting */
const LONG_LINE_THRESHOLD = 200;

/** Minimum existing line breaks to consider content already formatted */
const MIN_EXISTING_BREAKS = 5;

/**
 * Separate non-table text from table rows on the same line.
 * E.g. "some text: | Col1 | Col2 |" → "some text:\n\n| Col1 | Col2 |"
 */
function separateTextFromTables(lines: string[]): string[] {
  const output: string[] = [];
  for (const line of lines) {
    const pipeIdx = line.indexOf('|');
    if (pipeIdx > 0) {
      const textBefore = line.substring(0, pipeIdx).trim();
      const tableRow = line.substring(pipeIdx);
      const pipeCount = (tableRow.match(/\|/g) ?? []).length;
      if (textBefore && pipeCount >= 2) {
        output.push(textBefore, '', tableRow);
        continue;
      }
    }
    output.push(line);
  }
  return output;
}

/**
 * Break long prose lines into paragraphs at sentence boundaries.
 * Splits at ". A" / "! A" / "? A" / ") A" patterns where A is uppercase or emoji.
 * Only applies to non-table lines longer than the threshold.
 */
function splitLongProse(lines: string[]): string[] {
  const output: string[] = [];
  for (const line of lines) {
    if (line.startsWith('|') || line.length < LONG_LINE_THRESHOLD) {
      output.push(line);
      continue;
    }
    const withBreaks = line.replace(
      /([.!?)])\s+([A-ZÁÉÍÓÚÑ\p{Extended_Pictographic}])/gu,
      '$1\n\n$2',
    );
    output.push(withBreaks);
  }
  return output;
}

/**
 * Normalizes raw document content for better markdown rendering.
 * Content extracted from documents often lacks line breaks, preventing
 * markdown elements (tables, headings, lists) from rendering properly.
 *
 * Transformations applied:
 * 1. Fix table row boundaries ("| |" → "|\n|")
 * 2. Separate preceding prose from table rows
 * 3. Break long prose into paragraphs at sentence boundaries
 */
function normalizeDocumentContent(content: string): string {
  const existingBreaks = (content.match(/\n/g) ?? []).length;
  if (existingBreaks > MIN_EXISTING_BREAKS) return content;

  // Step 1: Fix markdown table row boundaries
  // "| |" (pipe, whitespace only, pipe) occurs between table rows
  // but NOT between cells within a row (which have text between pipes)
  let result = content.replace(/\|\s+\|/g, '|\n|');

  // Step 2: Separate non-table text from table content on the same line
  const linesAfterTables = separateTextFromTables(result.split('\n'));

  // Step 3: Break long prose into paragraphs at sentence boundaries
  const linesAfterProse = splitLongProse(linesAfterTables);

  result = linesAfterProse.join('\n');
  return result;
}

interface DocumentDetailDialogProps {
  document: KnowledgeSourceDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * DocumentDetailDialog
 * Shows the full detail of a knowledge source with rich content rendering.
 * Markdown content is rendered with headings, lists, code blocks, and tables.
 * PDF/Text content is displayed as formatted prose.
 */
export function DocumentDetailDialog({ document, open, onOpenChange }: DocumentDetailDialogProps) {
  const t = useTranslations('documents');
  const locale = useLocale();
  const allSectors = useAllSectors();

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
  const sectorName = allSectors.find((s) => s.id === document.sectorId)?.name ?? 'Unknown';

  const rawContent = detail?.content ?? null;
  const truncated =
    rawContent && rawContent.length > MAX_PREVIEW_CHARS
      ? rawContent.slice(0, MAX_PREVIEW_CHARS) + '…'
      : rawContent;
  const contentPreview = truncated ? normalizeDocumentContent(truncated) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[800px]">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <TypeIcon className="text-primary h-5 w-5" />
            </div>
            <span className="truncate">{document.title}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Metadata chips */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant={badgeVariant}>{t(`status.${document.status}`)}</Badge>

          <div className="text-muted-foreground flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>{sectorName}</span>
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5">
            <FileType className="h-3.5 w-3.5" />
            <span>{t(`sourceType.${document.sourceType}`)}</span>
          </div>

          {detail && (
            <div className="text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>
                {t('fragments')}: {detail.fragmentCount}
              </span>
            </div>
          )}

          <div className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(document.createdAt, locale)}</span>
          </div>
        </div>

        <Separator />

        {/* Content area */}
        <div className="min-h-0 flex-1">
          <h4 className="text-muted-foreground mb-3 text-sm font-medium">{t('documentContent')}</h4>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <span className="text-muted-foreground text-sm">{t('loadingDetail')}</span>
            </div>
          )}

          {/* Error */}
          {loadError && !isLoading && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          {/* Rich content preview */}
          {!isLoading && !loadError && contentPreview && (
            <ScrollArea className="h-[400px] rounded-md border bg-white p-6">
              <MarkdownRenderer
                content={contentPreview}
                className="text-foreground"
                data-testid="document-content"
              />
            </ScrollArea>
          )}

          {/* No content */}
          {!isLoading && !loadError && !contentPreview && (
            <p className="text-muted-foreground py-12 text-center text-sm">{t('noContent')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
