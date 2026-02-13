'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSetCurrentSectorId, useSetSectors } from '@/stores/user.store';
import { SECTORS } from '@/constants/sectors';
import { Building2, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Sector selector component
 * Allows user to select their current active sector
 * Issue 5.13: User Profile and Session Management
 */
export function SectorSelector() {
  const { currentSectorId, sectors } = useCurrentUser();
  const setCurrentSectorId = useSetCurrentSectorId();
  const setSectors = useSetSectors();

  // Initialize sectors list on mount (from centralized constant)
  useEffect(() => {
    if (sectors.length === 0) {
      setSectors(SECTORS.map((s) => ({ id: s.id, name: s.name })));
    }
  }, [sectors.length, setSectors]);

  // Auto-set first sector if none selected
  useEffect(() => {
    if (!currentSectorId && sectors.length > 0) {
      setCurrentSectorId(sectors[0].id);
    }
  }, [currentSectorId, sectors, setCurrentSectorId]);

  const currentSector = sectors.find((s) => s.id === currentSectorId);

  return (
    <div className="flex items-center gap-2">
      <Building2 className="text-muted-foreground h-4 w-4" />
      <span className="text-muted-foreground text-sm">Sector:</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {currentSector ? currentSector.name : 'Select Sector'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Your Sector</DropdownMenuLabel>
          <DropdownMenuSeparator />
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

      {currentSector && (
        <Badge variant="secondary" className="ml-2">
          Active
        </Badge>
      )}
    </div>
  );
}
