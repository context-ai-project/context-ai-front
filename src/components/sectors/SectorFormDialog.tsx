'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  SECTOR_ICONS,
  type SectorIcon,
  type Sector,
  type CreateSectorDto,
  type UpdateSectorDto,
} from '@/types/sector.types';
import {
  useAddSector,
  useUpdateSector,
  useSectorNameExists,
  useFindSimilarNames,
} from '@/stores/sector.store';
import { SECTOR_ICON_MAP } from './sector-icons';

// ── Constants ────────────────────────────────────────────────────────────────

const NAME_MIN = 2;
const NAME_MAX = 50;
const DESC_MIN = 10;
const DESC_MAX = 300;

// ── Props ────────────────────────────────────────────────────────────────────

interface SectorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog is in edit mode */
  sector?: Sector;
  /** Called after successful create or update */
  onSuccess?: () => void;
}

// ── Field errors type ────────────────────────────────────────────────────────

interface FieldErrors {
  name?: string;
  description?: string;
  icon?: string;
}

/** Get the submit button label based on current state */
function getSubmitLabel(isEdit: boolean, isSaving: boolean, t: (key: string) => string): string {
  if (isSaving) return isEdit ? t('form.saving') : t('form.creating');
  return isEdit ? t('form.saveButton') : t('form.createButton');
}

/**
 * Sector form dialog for creating and editing sectors
 *
 * Features:
 * - Icon selector (avatar) with grid of available icons
 * - Name uniqueness validation (exact match blocks, similar names warn)
 * - Character count and validation for name and description
 * - Active by default on creation
 */
export function SectorFormDialog({ open, onOpenChange, sector, onSuccess }: SectorFormDialogProps) {
  const t = useTranslations('sectors');
  const tIcons = useTranslations('sectors.icons');
  const isEdit = Boolean(sector);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<SectorIcon>('layout');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [similarWarning, setSimilarWarning] = useState<string | null>(null);
  const [similarAccepted, setSimilarAccepted] = useState(false);

  // Store actions (individual hooks to prevent unnecessary re-renders)
  const addSector = useAddSector();
  const updateSector = useUpdateSector();
  const sectorNameExists = useSectorNameExists();
  const findSimilarNames = useFindSimilarNames();

  // Reset form when dialog opens or sector changes
  useEffect(() => {
    if (open) {
      setName(sector?.name ?? '');
      setDescription(sector?.description ?? '');
      setIcon(sector?.icon ?? 'layout');
      setErrors({});
      setSimilarWarning(null);
      setSimilarAccepted(false);
      setIsSaving(false);
    }
  }, [open, sector]);

  // Validate name field
  const validateName = useCallback(
    (value: string): string | undefined => {
      const trimmed = value.trim();
      if (!trimmed) return t('validation.nameRequired');
      if (trimmed.length < NAME_MIN) return t('validation.nameMinLength');
      if (trimmed.length > NAME_MAX) return t('validation.nameMaxLength');
      if (sectorNameExists(trimmed, sector?.id)) return t('validation.nameExists');
      return undefined;
    },
    [t, sectorNameExists, sector?.id],
  );

  // Validate description field
  const validateDescription = useCallback(
    (value: string): string | undefined => {
      const trimmed = value.trim();
      if (!trimmed) return t('validation.descriptionRequired');
      if (trimmed.length < DESC_MIN) return t('validation.descriptionMinLength');
      if (trimmed.length > DESC_MAX) return t('validation.descriptionMaxLength');
      return undefined;
    },
    [t],
  );

  // Check for similar names when name changes
  useEffect(() => {
    const trimmed = name.trim();
    if (trimmed.length >= NAME_MIN && !sectorNameExists(trimmed, sector?.id)) {
      const similar = findSimilarNames(trimmed, sector?.id);
      if (similar.length > 0) {
        setSimilarWarning(t('validation.nameSimilar', { names: similar.join(', ') }));
        setSimilarAccepted(false);
      } else {
        setSimilarWarning(null);
      }
    } else {
      setSimilarWarning(null);
    }
  }, [name, sector?.id, sectorNameExists, findSimilarNames, t]);

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: FieldErrors = {
      name: validateName(name),
      description: validateDescription(description),
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.description;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateAll()) return;

    // If there's a similar name warning and user hasn't accepted it
    if (similarWarning && !similarAccepted) {
      setSimilarAccepted(true);
      return; // Show the warning, user must click again to confirm
    }

    setIsSaving(true);

    try {
      if (isEdit && sector) {
        const dto: UpdateSectorDto = {};
        if (name.trim() !== sector.name) dto.name = name.trim();
        if (description.trim() !== sector.description) dto.description = description.trim();
        if (icon !== sector.icon) dto.icon = icon;
        await updateSector(sector.id, dto);
      } else {
        const dto: CreateSectorDto = {
          name: name.trim(),
          description: description.trim(),
          icon,
        };
        await addSector(dto);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch {
      // Error is set in the store — could show a toast here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Icon selector (sector avatar) */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t('form.icon')}</label>
            <div className="grid grid-cols-6 gap-2">
              {SECTOR_ICONS.map((iconId) => {
                const IconComponent = SECTOR_ICON_MAP[iconId];
                const isSelected = icon === iconId;
                return (
                  <button
                    key={iconId}
                    type="button"
                    onClick={() => setIcon(iconId)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all',
                      'hover:border-primary/50 hover:bg-primary/5',
                      'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground',
                    )}
                    aria-label={tIcons(iconId)}
                    aria-pressed={isSelected}
                    title={tIcons(iconId)}
                  >
                    <IconComponent className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
            <p className="text-muted-foreground text-xs">{t('form.selectIcon')}</p>
          </div>

          {/* Name field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="sector-name" className="text-sm font-medium">
              {t('form.name')}
            </label>
            <Input
              id="sector-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }));
                }
              }}
              onBlur={() => setErrors((prev) => ({ ...prev, name: validateName(name) }))}
              placeholder={t('form.namePlaceholder')}
              maxLength={NAME_MAX}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={cn(errors.name && 'border-destructive')}
            />
            <div className="flex items-center justify-between">
              {errors.name ? (
                <p id="name-error" className="text-destructive text-xs" role="alert">
                  {errors.name}
                </p>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground text-xs">
                {name.length}/{NAME_MAX}
              </span>
            </div>

            {/* Similar name warning */}
            {similarWarning && !errors.name && (
              <div className="border-warning/30 bg-warning/10 flex items-start gap-2 rounded-md border p-3">
                <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-warning-foreground text-xs">{similarWarning}</p>
                  {similarAccepted && (
                    <Badge variant="secondary" className="mt-1 gap-1 text-xs">
                      <Check className="h-3 w-3" />
                      Acknowledged
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description field */}
          <div className="flex flex-col gap-2">
            <label htmlFor="sector-desc" className="text-sm font-medium">
              {t('form.description')}
            </label>
            <Textarea
              id="sector-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors((prev) => ({
                    ...prev,
                    description: validateDescription(e.target.value),
                  }));
                }
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  description: validateDescription(description),
                }))
              }
              placeholder={t('form.descriptionPlaceholder')}
              rows={3}
              maxLength={DESC_MAX}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'desc-error' : undefined}
              className={cn(errors.description && 'border-destructive')}
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <p id="desc-error" className="text-destructive text-xs" role="alert">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground text-xs">
                {description.length}/{DESC_MAX}
              </span>
            </div>
          </div>

          {/* Submit button */}
          <Button type="submit" className="mt-2" disabled={isSaving}>
            {getSubmitLabel(isEdit, isSaving, t)}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
