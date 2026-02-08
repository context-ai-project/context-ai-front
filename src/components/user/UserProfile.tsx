'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { LogoutButton } from './LogoutButton';
import { Building2, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * User profile component
 * Displays user information, current sector, and logout option
 * Issue 5.13: User Profile and Session Management
 */

export function UserProfile() {
  const { user, userName, userEmail, userPicture, currentSectorId, sectors } = useCurrentUser();

  // Find current sector name
  const currentSector = sectors.find((s: { id: string; name: string }) => s.id === currentSectorId);

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar src={userPicture} alt={userName} />
            <div>
              <CardTitle className="text-lg">{userName}</CardTitle>
              <p className="text-muted-foreground text-sm">{userEmail}</p>
            </div>
          </div>
          <LogoutButton variant="ghost" size="icon" showLabel={false} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Current Sector */}
        {currentSector ? (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground">Current Sector:</span>
            <Badge variant="secondary">{currentSector.name}</Badge>
          </div>
        ) : null}

        {/* User Role (from Auth0 metadata if available) */}
        {'role' in user && user.role ? (
          <div className="flex items-center gap-2 text-sm">
            <User className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground">Role:</span>
            <Badge>{String(user.role)}</Badge>
          </div>
        ) : null}

        {/* Email verification status */}
        {user.email_verified !== undefined ? (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground">Email:</span>
            <Badge variant={user.email_verified ? 'default' : 'destructive'}>
              {user.email_verified ? 'Verified' : 'Not Verified'}
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
