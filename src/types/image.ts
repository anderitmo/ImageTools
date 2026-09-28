export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type AspectRatioOption = 'original' | '1:1' | '4:3' | '16:9' | '3:2' | 'custom';

export type FilterOption = 'none' | 'grayscale' | 'sepia' | 'blur' | 'invert' | 'brightness' | 'contrast';

export type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface WatermarkConfig {
  text: string;
  color: string;
  opacity: number; // 0 to 1
  fontSize: number; // in pixels or relative
  position: WatermarkPosition;
}

export interface CropConfig {
  x: number; // in percentage 0 - 100
  y: number; // in percentage 0 - 100
  width: number; // in percentage 0 - 100
  height: number; // in percentage 0 - 100
}

export interface ImageProcessingOptions {
  format: ImageFormat;
  quality: number; // 0.1 to 1.0
  resizeMode: 'none' | 'percentage' | 'dimensions' | 'preset';
  scalePercentage: number; // 10 to 200
  targetWidth?: number;
  targetHeight?: number;
  maintainAspectRatio: boolean;
  aspectRatio: AspectRatioOption;
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
  filter: FilterOption;
  crop?: CropConfig;
  watermark?: WatermarkConfig;
}

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
  processedUrl?: string;
  processedSize?: number;
  processedWidth?: number;
  processedHeight?: number;
  errorMessage?: string;
  customOptions?: Partial<ImageProcessingOptions>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultFormat: ImageFormat;
  defaultQuality: number;
  autoProcess: boolean;
  preserveFileName: boolean;
  filePrefix: string;
  fileSuffix: string;
}
