/**
 * Shared constants for document display.
 *
 * Single source of truth for icon and badge variant mappings,
 * previously duplicated in DocumentsView and DocumentDetailDialog (CS-04).
 */

import { FileText, FileCode, Link as LinkIcon } from 'lucide-react';

/** Icon component type (any Lucide icon) */
export type IconComponent = typeof FileText;

/** Maps a knowledge source type to a Lucide icon */
export const TYPE_ICONS: Record<string, IconComponent> = {
  PDF: FileText,
  MARKDOWN: FileCode,
  TEXT: FileText,
  URL: LinkIcon,
};

/** Badge variant type used by shadcn/ui Badge */
export type BadgeVariant = 'default' | 'secondary' | 'destructive';

/** Maps a knowledge source status to a Badge variant */
export const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  PROCESSED: 'default',
  COMPLETED: 'default',
  PROCESSING: 'secondary',
  PENDING: 'secondary',
  FAILED: 'destructive',
};
