'use client';

import { useEffect, useState } from 'react';
import { useChatStore, useChatActions } from '@/stores/chat.store';
import { Button } from '@/components/ui/button';
import { Building2, Check } from 'lucide-react';

/**
 * Temporary sector selector component
 * Will be replaced by proper user profile management in Issue 5.13
 */

// Hardcoded test sector (from database test data)
const TEST_SECTOR_ID = '440e8400-e29b-41d4-a716-446655440000';

export function SectorSelector() {
  const { currentSectorId } = useChatStore();
  const { setCurrentSectorId } = useChatActions();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-set sector on mount if not already set
  useEffect(() => {
    if (!currentSectorId) {
      setCurrentSectorId(TEST_SECTOR_ID);
    }
  }, [currentSectorId, setCurrentSectorId]);

  if (!isOpen && currentSectorId) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-4 w-4" />
          <Building2 className="h-4 w-4" />
          <span className="font-medium">Sector configured</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="ml-auto text-green-600 hover:text-green-800"
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <Building2 className="h-5 w-5 shrink-0 text-yellow-600" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-900">Select Your Sector</h3>
          <p className="mt-1 text-sm text-yellow-700">
            Choose a sector to start chatting. This is temporary and will be replaced with proper
            user profile management.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setCurrentSectorId(TEST_SECTOR_ID);
                setIsOpen(false);
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Use Test Sector
            </Button>
            {currentSectorId && (
              <Button size="sm" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
