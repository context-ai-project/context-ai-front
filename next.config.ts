import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Create next-intl plugin with i18n config
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.auth0.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
