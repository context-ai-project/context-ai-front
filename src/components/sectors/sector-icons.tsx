/**
 * Icon map for sector avatars
 * Maps icon identifiers to Lucide React components
 */
import {
  Code,
  Users,
  TrendingUp,
  Layout,
  Heart,
  Briefcase,
  Building,
  Globe,
  Shield,
  Lightbulb,
  BookOpen,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import type { SectorIcon } from '@/types/sector.types';

/** Map of sector icon identifiers to their Lucide component */
export const SECTOR_ICON_MAP: Record<SectorIcon, LucideIcon> = {
  code: Code,
  users: Users,
  'trending-up': TrendingUp,
  layout: Layout,
  heart: Heart,
  briefcase: Briefcase,
  building: Building,
  globe: Globe,
  shield: Shield,
  lightbulb: Lightbulb,
  book: BookOpen,
  megaphone: Megaphone,
};

/** Get the Lucide component for a sector icon, with fallback */
export function getSectorIcon(icon: string): LucideIcon {
  return SECTOR_ICON_MAP[icon as SectorIcon] ?? Layout;
}

/**
 * Render a sector icon as a React component.
 * Use this instead of getSectorIcon() inside JSX to avoid
 * "component created during render" lint errors.
 */
export function SectorIconRenderer({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = SECTOR_ICON_MAP[icon as SectorIcon] ?? Layout;
  return <IconComponent className={className} />;
}
