import { render } from '@testing-library/react';
import { getSectorIcon, SectorIconRenderer, SECTOR_ICON_MAP } from '../sector-icons';
import { Code, Users, Layout } from 'lucide-react';

describe('sector-icons', () => {
  describe('SECTOR_ICON_MAP', () => {
    it('should have 12 icons', () => {
      expect(Object.keys(SECTOR_ICON_MAP)).toHaveLength(12);
    });

    it('should map code to Code icon', () => {
      expect(SECTOR_ICON_MAP.code).toBe(Code);
    });

    it('should map users to Users icon', () => {
      expect(SECTOR_ICON_MAP.users).toBe(Users);
    });
  });

  describe('getSectorIcon', () => {
    it('should return the correct icon for known types', () => {
      expect(getSectorIcon('code')).toBe(Code);
    });

    it('should return Layout as fallback for unknown icons', () => {
      expect(getSectorIcon('unknown-icon')).toBe(Layout);
    });
  });

  describe('SectorIconRenderer', () => {
    it('should render an icon element', () => {
      const { container } = render(<SectorIconRenderer icon="code" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should apply className', () => {
      const { container } = render(<SectorIconRenderer icon="code" className="h-5 w-5" />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toContain('h-5');
    });

    it('should render fallback for unknown icon', () => {
      const { container } = render(<SectorIconRenderer icon="zzz" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });
});
