'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSetCurrentSectorId, useSetSectors } from '@/stores/user.store';
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

// Temporary hardcoded sectors (will come from API in future)
const AVAILABLE_SECTORS = [
  {
    id: '440e8400-e29b-41d4-a716-446655440000',
    name: 'Human Resources',
  },
  {
    id: '440e8400-e29b-41d4-a716-446655440001',
    name: 'Engineering',
  },
  {
    id: '440e8400-e29b-41d4-a716-446655440002',
    name: 'Sales',
  },
];

export function SectorSelector() {
  const { currentSectorId, sectors } = useCurrentUser();
  const setCurrentSectorId = useSetCurrentSectorId();
  const setSectors = useSetSectors();

  // Initialize sectors list on mount
  useEffect(() => {
    if (sectors.length === 0) {
      setSectors(AVAILABLE_SECTORS);
    }
  }, [sectors.length, setSectors]);

  // Auto-set first sector if none selected
  useEffect(() => {
    if (!currentSectorId && AVAILABLE_SECTORS.length > 0) {
      setCurrentSectorId(AVAILABLE_SECTORS[0].id);
    }
  }, [currentSectorId, setCurrentSectorId]);

  const currentSector = AVAILABLE_SECTORS.find((s) => s.id === currentSectorId);

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
          {AVAILABLE_SECTORS.map((sector) => (
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
