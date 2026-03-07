'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { knowledgeApi, type KnowledgeSourceDto } from '@/lib/api/knowledge.api';
import {
  useSelectedSectorId,
  useSelectedDocumentIds,
  useToggleDocument,
} from '@/stores/capsule.store';

/** Only documents in these statuses are usable for capsule generation */
const USABLE_STATUSES = new Set<KnowledgeSourceDto['status']>(['COMPLETED']);

export function CapsuleDocumentList() {
  const t = useTranslations('capsules.wizard');
  const selectedSectorId = useSelectedSectorId();
  const selectedDocumentIds = useSelectedDocumentIds();
  const toggleDocument = useToggleDocument();

  const [documents, setDocuments] = useState<KnowledgeSourceDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDocs = async () => {
      if (!selectedSectorId) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const docs = await knowledgeApi.listDocuments(selectedSectorId);
        if (!cancelled) {
          setDocuments(docs.filter((d) => USABLE_STATUSES.has(d.status)));
        }
      } catch {
        // leave documents empty on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDocs();
    return () => {
      cancelled = true;
    };
  }, [selectedSectorId]);

  const filtered = documents.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));

  if (!selectedSectorId) return null;

  return (
    <div>
      <p className="text-foreground mb-2 text-sm font-medium">
        {t('documentsAvailable')}
        {selectedDocumentIds.length > 0 && (
          <span className="text-primary ml-2">
            ({selectedDocumentIds.length} {t('documentsSelected')})
          </span>
        )}
      </p>

      <div className="relative mb-2">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchDocuments')}
          className="pl-9"
        />
      </div>

      {isLoading && <div className="text-muted-foreground py-6 text-center text-sm">Loading…</div>}
      {!isLoading && filtered.length === 0 && documents.length === 0 && (
        <div className="text-muted-foreground py-6 text-center text-sm">
          No documents available in this sector.
        </div>
      )}
      {!isLoading && filtered.length === 0 && documents.length > 0 && (
        <div className="text-muted-foreground py-6 text-center text-sm">
          No documents match your search.
        </div>
      )}
      {!isLoading && filtered.length > 0 && (
        <ul className="border-border max-h-64 overflow-y-auto rounded-lg border">
          {filtered.map((doc) => {
            const isSelected = selectedDocumentIds.includes(doc.id);
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => toggleDocument(doc.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                    'hover:bg-accent',
                    isSelected && 'bg-primary/10',
                  )}
                >
                  <input
                    type="checkbox"
                    readOnly
                    checked={isSelected}
                    className="accent-primary pointer-events-none"
                    aria-hidden="true"
                  />
                  <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate font-medium">{doc.title}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
