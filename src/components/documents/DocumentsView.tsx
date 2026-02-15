'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import {
  FileText,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
  EllipsisVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAllSectors } from '@/stores/sector.store';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { KnowledgeSourceDto } from '@/lib/api/knowledge.api';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, CAN_UPLOAD } from '@/constants/permissions';
import { TYPE_ICONS, STATUS_BADGE_VARIANTS } from '@/constants/document-mappings';
import { formatDate } from '@/lib/utils/format-date';
import { DocumentDetailDialog } from './DocumentDetailDialog';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import { UploadDocumentDialog } from './UploadDocumentDialog';

/** Sector filter value for "all sectors" */
const ALL_SECTORS_VALUE = 'all';

/**
 * Get display name for sector by ID
 */
function getSectorName(sectorId: string, sectors: Array<{ id: string; name: string }>): string {
  const sector = sectors.find((s) => s.id === sectorId);
  return sector?.name ?? 'Unknown';
}

/**
 * DocumentsView component
 *
 * Main view for listing, searching, filtering, and uploading documents.
 * Upload logic is delegated to `useDocumentUpload` hook and
 * `UploadDocumentDialog` component (CS-07 refactor).
 */
export function DocumentsView() {
  const { data: session } = useSession();
  const t = useTranslations('documents');
  const allSectors = useAllSectors();

  // ── Document list state ───────────────────────────────────────────────
  const [documents, setDocuments] = useState<KnowledgeSourceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Filter state ──────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState(ALL_SECTORS_VALUE);

  // ── View / Delete dialog state ────────────────────────────────────────
  const [viewDoc, setViewDoc] = useState<KnowledgeSourceDto | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<KnowledgeSourceDto | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Permissions ───────────────────────────────────────────────────────
  const userRole = getUserRole(session?.user?.roles);
  const hasUploadPermission = hasPermission(userRole, CAN_UPLOAD);

  // ── Load documents on mount ───────────────────────────────────────────
  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const docs = await knowledgeApi.listDocuments();
        setDocuments(docs);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : t('errorLoading'));
      } finally {
        setIsLoading(false);
      }
    };
    void loadDocuments();
  }, [t]);

  // ── Derived data ──────────────────────────────────────────────────────
  const filtered = documents.filter((doc) => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchSector = filterSector === ALL_SECTORS_VALUE || doc.sectorId === filterSector;
    return matchSearch && matchSector;
  });

  // ── Callbacks ─────────────────────────────────────────────────────────
  const handleDocumentUploaded = useCallback((doc: KnowledgeSourceDto) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  const handleViewDocument = useCallback((doc: KnowledgeSourceDto) => {
    setViewDoc(doc);
    setViewOpen(true);
  }, []);

  const handleDeleteClick = useCallback((doc: KnowledgeSourceDto) => {
    setDeleteDoc(doc);
    setDeleteOpen(true);
  }, []);

  const handleDocumentDeleted = useCallback((documentId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
        </div>

        {hasUploadPermission && (
          <UploadDocumentDialog onDocumentUploaded={handleDocumentUploaded} />
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <Select value={filterSector} onValueChange={setFilterSector}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t('allSectors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_SECTORS_VALUE}>{t('allSectors')}</SelectItem>
              {allSectors.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">{t('loading')}</p>
        </div>
      )}

      {/* Error State */}
      {loadError && !isLoading && (
        <div className="mt-12 text-center">
          <AlertCircle className="text-destructive mx-auto h-12 w-12" />
          <p className="text-muted-foreground mt-4">{loadError}</p>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && !loadError && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <DocumentCardWithActions
              key={doc.id}
              doc={doc}
              allSectors={allSectors}
              hasUploadPermission={hasUploadPermission}
              onView={handleViewDocument}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && filtered.length === 0 && (
        <div className="mt-12 text-center">
          <FileText className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <p className="text-muted-foreground mt-4">{t('noResults')}</p>
        </div>
      )}

      {/* View Document Dialog */}
      <DocumentDetailDialog document={viewDoc} open={viewOpen} onOpenChange={setViewOpen} />

      {/* Delete Document Dialog */}
      <DeleteDocumentDialog
        document={deleteDoc}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDocumentDeleted}
      />
    </div>
  );
}

// ── DocumentCardWithActions ──────────────────────────────────────────────────

interface DocumentCardWithActionsProps {
  doc: KnowledgeSourceDto;
  allSectors: Array<{ id: string; name: string }>;
  hasUploadPermission: boolean;
  onView: (doc: KnowledgeSourceDto) => void;
  onDelete: (doc: KnowledgeSourceDto) => void;
}

/**
 * Document card with hover actions dropdown.
 * Mirrors the sector card pattern: a floating action button appears on hover
 * with a dropdown menu for view and delete actions.
 */
function DocumentCardWithActions({
  doc,
  allSectors,
  hasUploadPermission,
  onView,
  onDelete,
}: DocumentCardWithActionsProps) {
  const t = useTranslations('documents');
  const locale = useLocale();
  const TypeIcon = TYPE_ICONS[doc.sourceType] ?? FileText;
  const badgeVariant = STATUS_BADGE_VARIANTS[doc.status] ?? 'secondary';

  return (
    <div className="group relative">
      <Card
        className="hover:border-primary/30 cursor-pointer transition-colors"
        onClick={() => onView(doc)}
        role="button"
        tabIndex={0}
        aria-label={doc.title}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(doc);
          }
        }}
      >
        <CardContent className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <TypeIcon className="text-muted-foreground h-5 w-5" />
            </div>
            <Badge variant={badgeVariant} className="text-xs">
              {t(`status.${doc.status}`)}
            </Badge>
          </div>
          <h3 className="text-foreground mb-1 font-medium">{doc.title}</h3>
          <p className="text-muted-foreground mb-3 text-xs">
            {getSectorName(doc.sectorId, allSectors)}
          </p>
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span>{t(`sourceType.${doc.sourceType}`)}</span>
            <span>{formatDate(doc.createdAt, locale)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions dropdown — appears on hover, anchored top-right */}
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="bg-background/80 h-7 w-7 rounded-full shadow-sm backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
              aria-label={t('actions')}
            >
              <EllipsisVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView(doc)} className="gap-2">
              <Eye className="h-4 w-4" />
              {t('viewDocument')}
            </DropdownMenuItem>

            {hasUploadPermission && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(doc)}
                  className="text-destructive focus:text-destructive gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('deleteDocument')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
