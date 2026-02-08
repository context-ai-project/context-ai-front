'use client';

import Image from 'next/image';
import { Avatar } from '@/components/ui/avatar';

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
  sm: { width: 32, height: 32, className: 'h-8 w-8' },
  md: { width: 40, height: 40, className: 'h-10 w-10' },
  lg: { width: 56, height: 56, className: 'h-14 w-14' },
};

/**
 * User avatar component with optimized image loading
 * Falls back to user's initial if no picture is available
 * Can accept either a user object or src/alt props
 * Issue 5.13: Enhanced for user profile management
 */
export function UserAvatar({ user, src, alt, size = 'md' }: UserAvatarProps) {
  const avatarSrc = src || user?.picture || '';
  const avatarName = alt || user?.name || 'User';
  const initial = avatarName?.charAt(0).toUpperCase() || 'U';
  const dimensions = sizeMap[size];

  return (
    <Avatar className={dimensions.className}>
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={`${avatarName} avatar`}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-full object-cover"
          priority={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
          {initial}
        </div>
      )}
    </Avatar>
  );
}
