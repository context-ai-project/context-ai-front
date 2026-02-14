'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Upload,
  Search,
  FileCode,
  Filter,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SECTORS } from '@/constants/sectors';
import { knowledgeApi } from '@/lib/api/knowledge.api';
import type { KnowledgeSourceDto, SourceType } from '@/lib/api/knowledge.api';
import { cn } from '@/lib/utils';
import { DocumentDetailDialog } from './DocumentDetailDialog';
import { DeleteDocumentDialog } from './DeleteDocumentDialog';

/** Type icon mapping */
type IconComponent = typeof FileText;
const TYPE_ICONS: Record<string, IconComponent> = {
  PDF: FileText,
  MARKDOWN: FileCode,
  TEXT: FileText,
  URL: LinkIcon,
};

/** Roles allowed to upload documents */
const UPLOAD_ROLES = ['admin', 'manager'];

/** Maximum file size in bytes (10MB) */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** File type to source type mapping */
const FILE_TYPE_MAP: Record<string, SourceType> = {
  'application/pdf': 'PDF',
  'text/markdown': 'MARKDOWN',
  'text/plain': 'MARKDOWN',
};

/** Accepted MIME types */
const ACCEPTED_MIME_TYPES = '.pdf,.md,.txt';

/** Sector filter value for "all sectors" */
const ALL_SECTORS_VALUE = 'all';

/** Badge variant mapping for document status */
type BadgeVariant = 'default' | 'secondary' | 'destructive';
const STATUS_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  PROCESSED: 'default',
  COMPLETED: 'default',
  PROCESSING: 'secondary',
  PENDING: 'secondary',
  FAILED: 'destructive',
};

/**
 * Get display name for sector by ID
 */
function getSectorName(sectorId: string): string {
  const sector = SECTORS.find((s) => s.id === sectorId);
  return sector?.name ?? 'Unknown';
}

/**
 * Format date string to readable format
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Detect source type from file
 */
function detectSourceType(file: File): SourceType {
  const mimeType = FILE_TYPE_MAP[file.type];
  if (mimeType) return mimeType;

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'md' || ext === 'txt') return 'MARKDOWN';

  return 'PDF';
}

/**
 * DocumentsView component
 * Main view for listing, searching, filtering, and uploading documents.
 * Follows the prototype design: grid of document cards + upload dialog.
 */
export function DocumentsView() {
  const { data: session } = useSession();
  const t = useTranslations('documents');

  // State: document list
  const [documents, setDocuments] = useState<KnowledgeSourceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // State: filters
  const [search, setSearch] = useState('');
  const [filterSector, setFilterSector] = useState(ALL_SECTORS_VALUE);

  // State: upload dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSectorId, setUploadSectorId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // State: view / delete dialogs
  const [viewDoc, setViewDoc] = useState<KnowledgeSourceDto | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<KnowledgeSourceDto | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Check user role for upload permission
  const userRoles = session?.user?.roles ?? [];
  const hasUploadPermission = userRoles.some((role) => UPLOAD_ROLES.includes(role));

  // Load documents on mount
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

  // Filter documents
  const filtered = documents.filter((doc) => {
    const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchSector = filterSector === ALL_SECTORS_VALUE || doc.sectorId === filterSector;
    return matchSearch && matchSector;
  });

  // Handle file selection
  const handleFileSelect = useCallback(
    (file: File | null) => {
      setUploadError(null);
      if (!file) {
        setUploadFile(null);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError('File too large. Maximum size is 10MB.');
        return;
      }
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^.]+$/, ''));
      }
    },
    [uploadTitle],
  );

  // Handle drag & drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Handle upload submit
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim() || !uploadSectorId) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const sourceType = detectSourceType(uploadFile);
      const response = await knowledgeApi.uploadDocument({
        file: uploadFile,
        title: uploadTitle.trim(),
        sectorId: uploadSectorId,
        sourceType,
      });

      // Add the new document to the list immediately
      const newDoc: KnowledgeSourceDto = {
        id: response.sourceId,
        title: response.title,
        sectorId: uploadSectorId,
        sourceType,
        status: response.status === 'COMPLETED' ? 'PROCESSED' : 'PROCESSING',
        metadata: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDocuments((prev) => [newDoc, ...prev]);

      // Reset dialog form
      setUploadFile(null);
      setUploadTitle('');
      setUploadSectorId('');
      if (fileRef.current) fileRef.current.value = '';
      setDialogOpen(false);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('uploadDialog.error'));
    } finally {
      setIsUploading(false);
    }
  };

  // Reset dialog state when closing
  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setUploadFile(null);
      setUploadTitle('');
      setUploadSectorId('');
      setUploadError(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // View document handler
  const handleViewDocument = useCallback((doc: KnowledgeSourceDto) => {
    setViewDoc(doc);
    setViewOpen(true);
  }, []);

  // Delete document handlers
  const handleDeleteClick = useCallback((doc: KnowledgeSourceDto) => {
    setDeleteDoc(doc);
    setDeleteOpen(true);
  }, []);

  const handleDocumentDeleted = useCallback((documentId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
  }, []);

  const isUploadFormValid = uploadFile && uploadTitle.trim() && uploadSectorId;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
        </div>

        {hasUploadPermission && (
          <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                {t('uploadButton')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('uploadDialog.title')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="flex flex-col gap-4">
                {/* Document Title */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="doc-title" className="text-sm font-medium">
                    {t('uploadDialog.documentTitle')}
                  </label>
                  <Input
                    id="doc-title"
                    name="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={t('uploadDialog.documentTitlePlaceholder')}
                    maxLength={255}
                    disabled={isUploading}
                    required
                  />
                </div>

                {/* Target Sector */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="doc-sector" className="text-sm font-medium">
                    {t('uploadDialog.targetSector')}
                  </label>
                  <Select
                    value={uploadSectorId}
                    onValueChange={setUploadSectorId}
                    disabled={isUploading}
                  >
                    <SelectTrigger id="doc-sector">
                      <SelectValue placeholder={t('uploadDialog.selectSector')} />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Drop Zone */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="doc-file" className="text-sm font-medium">
                    {t('uploadDialog.file')}
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click();
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                      isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                      uploadFile && 'border-green-500/50 bg-green-50/50',
                    )}
                  >
                    <input
                      ref={fileRef}
                      id="doc-file"
                      type="file"
                      className="hidden"
                      accept={ACCEPTED_MIME_TYPES}
                      onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                    />

                    {uploadFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{uploadFile.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {(uploadFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">
                          {isDragOver
                            ? t('uploadDialog.dropzoneActive')
                            : t('uploadDialog.dropzoneText')}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Upload Error */}
                {uploadError && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Submit */}
                <Button type="submit" className="mt-2" disabled={!isUploadFormValid || isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('uploadDialog.uploading')}
                    </>
                  ) : (
                    t('uploadAndIndex')
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
              {SECTORS.map((s) => (
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
          {filtered.map((doc) => {
            const TypeIcon = TYPE_ICONS[doc.sourceType] ?? FileText;
            const badgeVariant = STATUS_BADGE_VARIANTS[doc.status] ?? 'secondary';

            return (
              <Card key={doc.id} className="hover:border-primary/30 group transition-colors">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                      <TypeIcon className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant} className="text-xs">
                        {t(`status.${doc.status}`)}
                      </Badge>
                    </div>
                  </div>
                  <h3 className="text-foreground mb-1 font-medium">{doc.title}</h3>
                  <p className="text-muted-foreground mb-3 text-xs">
                    {getSectorName(doc.sectorId)}
                  </p>
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>{t(`sourceType.${doc.sourceType}`)}</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                  {/* Action buttons */}
                  <div className="mt-3 flex items-center gap-2 border-t pt-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('viewDocument')}
                    </Button>
                    {hasUploadPermission && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-8 gap-1.5 text-xs"
                        onClick={() => handleDeleteClick(doc)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('deleteDocument')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
