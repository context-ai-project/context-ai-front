'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/**
 * Logout button with confirmation dialog
 * Uses shared useLogout hook for consistent logout behavior
 */

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  showLabel = true,
}: LogoutButtonProps) {
  const { logout, isLoggingOut } = useLogout();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isLoggingOut}
          aria-label={showLabel ? undefined : 'Logout'}
        >
          <LogOut className="h-4 w-4" />
          {showLabel && <span className="ml-2">Logout</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be signed out of your account and redirected to the login page. Any unsaved
            changes will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={logout}>Logout</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
