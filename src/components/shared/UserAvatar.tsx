'use client';

import Image from 'next/image';
import { Avatar } from '@/components/ui/avatar';

interface UserAvatarProps {
  user: {
    name?: string | null;
    picture?: string | null;
  };
}

/**
 * User avatar component with optimized image loading
 * Falls back to user's initial if no picture is available
 */
export function UserAvatar({ user }: UserAvatarProps) {
  const initial = user.name?.charAt(0).toUpperCase() || 'U';
  const avatarName = user.name || 'User avatar';

  return (
    <Avatar className="h-10 w-10">
      {user.picture ? (
        <Image
          src={user.picture}
          alt={avatarName}
          width={40}
          height={40}
          className="rounded-full object-cover"
          priority={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-white">
          {initial}
        </div>
      )}
    </Avatar>
  );
}
