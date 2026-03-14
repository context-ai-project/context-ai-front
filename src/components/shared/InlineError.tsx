/**
 * Reusable inline error message (CS-14).
 *
 * Replaces the repeated error-box pattern across InviteUserDialog,
 * ToggleUserStatusDialog, ChangeRoleDialog, SectorsView, and UsersTab.
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div
      className={`border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-2 text-sm ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}
