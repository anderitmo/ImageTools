import { describe, it, expect } from 'vitest';
import { calculateNewDimensions, formatBytes, formatToExtension, formatToLabel } from './imageProcessor';
import { ImageProcessingOptions } from '../types/image';

describe('imageProcessor utilities', () => {
  it('formats byte sizes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1500000, 2)).toBe('1.43 MB');
  });

  it('maps image formats to file extension and labels', () => {
    expect(formatToExtension('image/jpeg')).toBe('jpg');
    expect(formatToExtension('image/png')).toBe('png');
    expect(formatToExtension('image/webp')).toBe('webp');

    expect(formatToLabel('image/jpeg')).toBe('JPG / JPEG');
    expect(formatToLabel('image/png')).toBe('PNG');
    expect(formatToLabel('image/webp')).toBe('WebP');
  });

  describe('calculateNewDimensions', () => {
    const baseOptions: ImageProcessingOptions = {
      format: 'image/jpeg',
      quality: 0.8,
      resizeMode: 'none',
      scalePercentage: 100,
      maintainAspectRatio: true,
      aspectRatio: 'original',
      rotation: 0,
      flipH: false,
      flipV: false,
      filter: 'none',
    };

    it('returns original dimensions when resizeMode is none', () => {
      const dim = calculateNewDimensions(1920, 1080, baseOptions);
      expect(dim).toEqual({ width: 1920, height: 1080 });
    });

    it('scales dimensions proportionally by percentage', () => {
      const dim = calculateNewDimensions(1000, 500, {
        ...baseOptions,
        resizeMode: 'percentage',
        scalePercentage: 50,
      });
      expect(dim).toEqual({ width: 500, height: 250 });
    });

    it('resizes with maintainAspectRatio true given target width', () => {
      const dim = calculateNewDimensions(1920, 1080, {
        ...baseOptions,
        resizeMode: 'dimensions',
        targetWidth: 960,
      });
      expect(dim).toEqual({ width: 960, height: 540 });
    });

    it('resizes with custom preset ratio 1:1', () => {
      const dim = calculateNewDimensions(800, 600, {
        ...baseOptions,
        resizeMode: 'preset',
        aspectRatio: '1:1',
      });
      expect(dim).toEqual({ width: 800, height: 800 });
    });
  });
});
