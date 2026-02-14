'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserInitials } from '@/lib/utils/get-user-initials';

interface UserAvatarProps {
  user?: {
    name?: string | null;
    picture?: string | null;
  };
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

/**
 * User avatar component with optimized image loading
 * Falls back to user's initials if no picture is available
 * Can accept either a user object or src/alt props
 * Issue 5.13: Enhanced for user profile management
 */
export function UserAvatar({ user, src, alt, size = 'md' }: UserAvatarProps) {
  const avatarSrc = src || user?.picture || undefined;
  const avatarName = alt || user?.name || 'User';
  const initials = getUserInitials(avatarName);

  return (
    <Avatar className={sizeMap[size]}>
      <AvatarImage
        src={avatarSrc}
        alt={`${avatarName} avatar`}
        className="rounded-full object-cover"
      />
      <AvatarFallback className="rounded-full bg-blue-600 text-sm font-medium text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
