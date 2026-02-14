import { describe, it, expect } from 'vitest';
import {
  IMAGE_SIZES,
  IMAGE_QUALITY,
  PLACEHOLDER_BLUR,
  generateSrcSet,
  getOptimalSize,
} from '../image-config';

describe('image-config', () => {
  describe('IMAGE_SIZES', () => {
    it('should define avatar sizes', () => {
      expect(IMAGE_SIZES.avatar.sm).toBe(32);
      expect(IMAGE_SIZES.avatar.md).toBe(40);
      expect(IMAGE_SIZES.avatar.lg).toBe(56);
      expect(IMAGE_SIZES.avatar.xl).toBe(80);
    });

    it('should define logo sizes', () => {
      expect(IMAGE_SIZES.logo.sm).toBe(120);
      expect(IMAGE_SIZES.logo.md).toBe(180);
      expect(IMAGE_SIZES.logo.lg).toBe(240);
    });

    it('should define thumbnail sizes', () => {
      expect(IMAGE_SIZES.thumbnail.sm).toBe(150);
      expect(IMAGE_SIZES.thumbnail.md).toBe(300);
      expect(IMAGE_SIZES.thumbnail.lg).toBe(450);
    });
  });

  describe('IMAGE_QUALITY', () => {
    it('should define quality settings for different types', () => {
      expect(IMAGE_QUALITY.avatar).toBe(90);
      expect(IMAGE_QUALITY.logo).toBe(95);
      expect(IMAGE_QUALITY.content).toBe(85);
      expect(IMAGE_QUALITY.thumbnail).toBe(75);
    });
  });

  describe('PLACEHOLDER_BLUR', () => {
    it('should be a valid data URL', () => {
      expect(PLACEHOLDER_BLUR).toContain('data:image/svg+xml;base64,');
    });
  });

  describe('generateSrcSet', () => {
    it('should generate srcSet string for given sizes', () => {
      const result = generateSrcSet('/images/avatar.jpg', [100, 200, 300]);

      expect(result).toBe(
        '/images/avatar.jpg?w=100 100w, /images/avatar.jpg?w=200 200w, /images/avatar.jpg?w=300 300w',
      );
    });

    it('should handle single size', () => {
      const result = generateSrcSet('/img.jpg', [400]);

      expect(result).toBe('/img.jpg?w=400 400w');
    });

    it('should handle empty sizes array', () => {
      const result = generateSrcSet('/img.jpg', []);

      expect(result).toBe('');
    });
  });

  describe('getOptimalSize', () => {
    it('should return base size when dpr is 1 (default)', () => {
      const result = getOptimalSize(100);

      expect(result).toBe(100);
    });

    it('should multiply base size by dpr', () => {
      const result = getOptimalSize(100, 2);

      expect(result).toBe(200);
    });

    it('should cap at 3x the base size', () => {
      const result = getOptimalSize(100, 4);

      expect(result).toBe(300);
    });

    it('should handle dpr of 3 exactly', () => {
      const result = getOptimalSize(100, 3);

      expect(result).toBe(300);
    });

    it('should handle fractional dpr', () => {
      const result = getOptimalSize(100, 1.5);

      expect(result).toBe(150);
    });
  });
});
