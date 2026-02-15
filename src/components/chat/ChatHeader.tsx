'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Brain, Building2, Check, ChevronDown } from 'lucide-react';
import {
  useCurrentSectorId,
  useSectors,
  useSetCurrentSectorId,
  useSetSectors,
} from '@/stores/user.store';
import { useActiveSectors } from '@/stores/sector.store';
import { getUserRole } from '@/lib/utils/get-user-role';
import { hasPermission, ADMIN_LEVEL_ROLES } from '@/constants/permissions';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/**
 * Chat header component with sector selector
 *
 * Behavior based on user role:
 * - Admin/Manager: Shows a dropdown to select from all available sectors
 * - Regular user with one sector: Shows only the assigned sector (read-only)
 */
export function ChatHeader() {
  const { data: session } = useSession();
  const t = useTranslations('chat');
  const tSector = useTranslations('sector');
  const currentSectorId = useCurrentSectorId();
  const sectors = useSectors();
  const setCurrentSectorId = useSetCurrentSectorId();
  const setSectors = useSetSectors();
  const activeSectors = useActiveSectors();

  // Sync user-store sectors with active sectors from the sector store
  useEffect(() => {
    setSectors(activeSectors.map((s) => ({ id: s.id, name: s.name })));
  }, [activeSectors, setSectors]);

  // Auto-select first sector if none is selected or current sector is no longer active
  useEffect(() => {
    const currentStillActive = sectors.some((s) => s.id === currentSectorId);
    if ((!currentSectorId || !currentStillActive) && sectors.length > 0) {
      setCurrentSectorId(sectors[0].id);
    }
  }, [currentSectorId, sectors, setCurrentSectorId]);

  const userRole = getUserRole(session?.user?.roles);
  const isAdmin = hasPermission(userRole, ADMIN_LEVEL_ROLES);
  const currentSector = sectors.find((s) => s.id === currentSectorId);
  const hasSingleSector = sectors.length === 1;
  const showDropdown = isAdmin || !hasSingleSector;

  return (
    <div className="border-border flex items-center justify-between border-b px-6 py-3">
      {/* Title section */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <Brain className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-foreground text-sm font-semibold">{t('header.title')}</h1>
          <p className="text-muted-foreground text-xs">{t('header.subtitle')}</p>
        </div>
      </div>

      {/* Sector selector */}
      <div className="flex items-center gap-2">
        <Building2 className="text-muted-foreground h-4 w-4" />

        {showDropdown ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {currentSector ? currentSector.name : tSector('selectSector')}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {sectors.map((sector) => (
                <DropdownMenuItem
                  key={sector.id}
                  onClick={() => setCurrentSectorId(sector.id)}
                  className="flex items-center justify-between"
                >
                  <span>{sector.name}</span>
                  {currentSectorId === sector.id && <Check className="text-primary h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
            {currentSector?.name ?? tSector('selectSector')}
          </Badge>
        )}
      </div>
    </div>
  );
}
