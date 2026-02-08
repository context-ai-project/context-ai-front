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
 * Renders a user avatar: an image when a source is available, otherwise a circular initial fallback.
 *
 * @param user - Optional user object; used to derive `picture` for the image source and `name` for the alt text/fallback initial.
 * @param src - Optional explicit image source that overrides `user.picture` when provided.
 * @param alt - Optional explicit display name used for the image alt text and fallback initial; falls back to `user.name` or `"User"`.
 * @param size - Visual size variant (`'sm' | 'md' | 'lg'`) that controls the avatar's dimensions and wrapper classes.
 * @returns A JSX element containing the avatar image when a source exists, or a styled circular placeholder with the user's initial.
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