'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, FolderOpen, Power, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAllSectors, useSectorLoading, useSectorError } from '@/stores/sector.store';
import type { Sector } from '@/types/sector.types';
import { SectorCard } from './SectorCard';
import { SectorFormDialog } from './SectorFormDialog';
import { DeleteSectorDialog } from './DeleteSectorDialog';
import { ToggleStatusDialog } from './ToggleStatusDialog';
import { SectorIconRenderer } from './sector-icons';

type DialogType = 'create' | 'edit' | 'delete' | 'toggle' | null;

/**
 * Main sectors management view
 *
 * Features:
 * - Card grid with sector summaries
 * - Search/filter
 * - Create new sector
 * - Click card → view details with edit/delete/toggle actions
 * - Admin-only access (enforced by page/sidebar)
 */
export function SectorsView() {
  const t = useTranslations('sectors');
  const sectors = useAllSectors();
  const isLoading = useSectorLoading();
  const error = useSectorError();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

  // Filtered sectors
  const filteredSectors = useMemo(() => {
    if (!searchQuery.trim()) return sectors;
    const query = searchQuery.toLowerCase();
    return sectors.filter(
      (s) => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query),
    );
  }, [sectors, searchQuery]);

  // Handlers
  const openCreate = () => {
    setSelectedSector(null);
    setActiveDialog('create');
  };

  const openSectorDetail = (sector: Sector) => {
    setSelectedSector(sector);
    setActiveDialog('edit');
  };

  const openDelete = (sector: Sector) => {
    setSelectedSector(sector);
    setActiveDialog('delete');
  };

  const openToggle = (sector: Sector) => {
    setSelectedSector(sector);
    setActiveDialog('toggle');
  };

  const closeDialog = () => {
    setActiveDialog(null);
    setSelectedSector(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('newSector')}
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-10"
            aria-label={t('searchPlaceholder')}
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {filteredSectors.length} / {sectors.length}
        </Badge>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive mb-4 rounded-md border p-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && sectors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="border-muted border-t-primary h-8 w-8 animate-spin rounded-full border-4" />
          <p className="text-muted-foreground mt-4 text-sm">{t('loading')}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredSectors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <FolderOpen className="text-muted-foreground h-8 w-8" />
          </div>
          <p className="text-muted-foreground mt-4 text-sm">
            {searchQuery ? t('noResults') : t('empty')}
          </p>
        </div>
      )}

      {/* Sector grid */}
      {filteredSectors.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSectors.map((sector) => (
            <SectorCardWithActions
              key={sector.id}
              sector={sector}
              onEdit={openSectorDetail}
              onDelete={openDelete}
              onToggle={openToggle}
            />
          ))}
        </div>
      )}

      {/* Create dialog */}
      <SectorFormDialog
        open={activeDialog === 'create'}
        onOpenChange={(open) => !open && closeDialog()}
        onSuccess={closeDialog}
      />

      {/* Edit dialog (click on card opens this) */}
      <SectorFormDialog
        open={activeDialog === 'edit'}
        onOpenChange={(open) => !open && closeDialog()}
        sector={selectedSector ?? undefined}
        onSuccess={closeDialog}
      />

      {/* Delete dialog */}
      <DeleteSectorDialog
        open={activeDialog === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        sector={selectedSector}
        onSuccess={closeDialog}
      />

      {/* Toggle status dialog */}
      <ToggleStatusDialog
        open={activeDialog === 'toggle'}
        onOpenChange={(open) => !open && closeDialog()}
        sector={selectedSector}
        onSuccess={closeDialog}
      />
    </div>
  );
}

// ── SectorCardWithActions ────────────────────────────────────────────────────

interface SectorCardWithActionsProps {
  sector: Sector;
  onEdit: (sector: Sector) => void;
  onDelete: (sector: Sector) => void;
  onToggle: (sector: Sector) => void;
}

/**
 * Wrapper around SectorCard that adds an actions dropdown
 * anchored to the pencil button in the top-right corner.
 * Clicking the card itself opens the edit dialog directly.
 */
function SectorCardWithActions({ sector, onEdit, onDelete, onToggle }: SectorCardWithActionsProps) {
  const t = useTranslations('sectors');
  const tStatus = useTranslations('sectors.status');
  const tDelete = useTranslations('sectors.delete');
  const isActive = sector.status === 'active';

  return (
    <div className="group relative">
      {/* Card — click opens edit dialog */}
      <SectorCard sector={sector} onClick={onEdit} />

      {/* Actions dropdown anchored to the pencil button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="bg-background/80 h-7 w-7 rounded-full shadow-sm backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
              aria-label={t('form.editTitle')}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(sector)} className="gap-2">
              <SectorIconRenderer icon={sector.icon} className="h-4 w-4" />
              {t('form.editTitle')}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onToggle(sector)} className="gap-2">
              <Power className="h-4 w-4" />
              {isActive ? tStatus('deactivateTitle') : tStatus('activateTitle')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(sector)}
              className="text-destructive focus:text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {tDelete('title')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
