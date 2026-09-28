import { ImageFormat, ImageProcessingOptions, WatermarkConfig, FilterOption } from '../types/image';
import JSZip from 'jszip';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatToExtension(format: ImageFormat): string {
  switch (format) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

export function formatToLabel(format: ImageFormat): string {
  switch (format) {
    case 'image/jpeg':
      return 'JPG / JPEG';
    case 'image/png':
      return 'PNG';
    case 'image/webp':
      return 'WebP';
    default:
      return 'JPG';
  }
}

export function calculateNewDimensions(
  origWidth: number,
  origHeight: number,
  options: ImageProcessingOptions
): { width: number; height: number } {
  const { resizeMode, scalePercentage, targetWidth, targetHeight, maintainAspectRatio, aspectRatio } = options;

  let width = origWidth;
  let height = origHeight;

  if (resizeMode === 'percentage') {
    const scale = Math.max(1, scalePercentage) / 100;
    width = Math.round(origWidth * scale);
    height = Math.round(origHeight * scale);
  } else if (resizeMode === 'dimensions') {
    if (targetWidth && targetHeight) {
      if (maintainAspectRatio) {
        const ratio = origWidth / origHeight;
        if (targetWidth / targetHeight > ratio) {
          height = targetHeight;
          width = Math.round(targetHeight * ratio);
        } else {
          width = targetWidth;
          height = Math.round(targetWidth / ratio);
        }
      } else {
        width = targetWidth;
        height = targetHeight;
      }
    } else if (targetWidth) {
      width = targetWidth;
      height = maintainAspectRatio ? Math.round(targetWidth / (origWidth / origHeight)) : origHeight;
    } else if (targetHeight) {
      height = targetHeight;
      width = maintainAspectRatio ? Math.round(targetHeight * (origWidth / origHeight)) : origWidth;
    }
  } else if (resizeMode === 'preset') {
    let targetRatio = origWidth / origHeight;
    if (aspectRatio === '1:1') targetRatio = 1;
    else if (aspectRatio === '4:3') targetRatio = 4 / 3;
    else if (aspectRatio === '16:9') targetRatio = 16 / 9;
    else if (aspectRatio === '3:2') targetRatio = 3 / 2;

    width = origWidth;
    height = Math.round(origWidth / targetRatio);
  }

  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}

export function loadImage(src: string | Blob | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrl: string | null = null;
    if (typeof src === 'string') {
      img.src = src;
    } else {
      objectUrl = URL.createObjectURL(src);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao carregar imagem: ' + err));
    };
  });
}

export async function getImageMetadata(file: File): Promise<{ width: number; height: number; previewUrl: string }> {
  const previewUrl = URL.createObjectURL(file);
  const img = await loadImage(previewUrl);
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    previewUrl,
  };
}

export function applyCanvasFilter(ctx: CanvasRenderingContext2D, filter: FilterOption) {
  switch (filter) {
    case 'grayscale':
      ctx.filter = 'grayscale(100%)';
      break;
    case 'sepia':
      ctx.filter = 'sepia(100%)';
      break;
    case 'blur':
      ctx.filter = 'blur(4px)';
      break;
    case 'invert':
      ctx.filter = 'invert(100%)';
      break;
    case 'brightness':
      ctx.filter = 'brightness(130%)';
      break;
    case 'contrast':
      ctx.filter = 'contrast(140%)';
      break;
    default:
      ctx.filter = 'none';
      break;
  }
}

export function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  watermark: WatermarkConfig
) {
  if (!watermark.text.trim()) return;

  ctx.save();
  ctx.globalAlpha = watermark.opacity;
  ctx.fillStyle = watermark.color || '#ffffff';

  const fontSize = Math.max(12, Math.round((width / 800) * watermark.fontSize));
  ctx.font = `bold ${fontSize}px sans-serif`;

  const textMetrics = ctx.measureText(watermark.text);
  const textWidth = textMetrics.width;
  const padding = fontSize * 0.8;

  let x = padding;
  let y = height - padding;

  switch (watermark.position) {
    case 'center':
      x = (width - textWidth) / 2;
      y = height / 2 + fontSize / 3;
      break;
    case 'top-left':
      x = padding;
      y = padding + fontSize;
      break;
    case 'top-right':
      x = width - textWidth - padding;
      y = padding + fontSize;
      break;
    case 'bottom-left':
      x = padding;
      y = height - padding;
      break;
    case 'bottom-right':
      x = width - textWidth - padding;
      y = height - padding;
      break;
  }

  // Draw slight text shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.fillText(watermark.text, x, y);
  ctx.restore();
}

export async function processImage(
  source: HTMLImageElement | File | Blob | string,
  options: ImageProcessingOptions
): Promise<{ blob: Blob; url: string; width: number; height: number; size: number }> {
  let img: HTMLImageElement;
  if (typeof source === 'string' || source instanceof File || source instanceof Blob) {
    img = await loadImage(source);
  } else {
    img = source;
  }

  const origWidth = img.naturalWidth || img.width;
  const origHeight = img.naturalHeight || img.height;

  // Calculate target dimensions
  let { width: targetWidth, height: targetHeight } = calculateNewDimensions(origWidth, origHeight, options);

  // Apply cropping if configured
  let cropX = 0;
  let cropY = 0;
  let cropW = origWidth;
  let cropH = origHeight;

  if (options.crop && options.crop.width > 0 && options.crop.height > 0) {
    cropX = Math.round((options.crop.x / 100) * origWidth);
    cropY = Math.round((options.crop.y / 100) * origHeight);
    cropW = Math.round((options.crop.width / 100) * origWidth);
    cropH = Math.round((options.crop.height / 100) * origHeight);

    // Adjust target dimensions if crop is active and no explicit dimension set
    if (options.resizeMode === 'none') {
      targetWidth = cropW;
      targetHeight = cropH;
    }
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');
  }

  // Handle rotation orientation (90 or 270 flips width and height)
  const isRotated = options.rotation === 90 || options.rotation === 270;
  const canvasWidth = isRotated ? targetHeight : targetWidth;
  const canvasHeight = isRotated ? targetWidth : targetHeight;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Background for PNG -> JPG transparency fill (JPEG doesn't support transparency)
  if (options.format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  ctx.save();

  // Move origin to center for rotation and flip transformation
  ctx.translate(canvasWidth / 2, canvasHeight / 2);

  if (options.rotation !== 0) {
    ctx.rotate((options.rotation * Math.PI) / 180);
  }

  const scaleX = options.flipH ? -1 : 1;
  const scaleY = options.flipV ? -1 : 1;
  ctx.scale(scaleX, scaleY);

  // Apply visual filters
  applyCanvasFilter(ctx, options.filter);

  // Draw source image onto transformed canvas
  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropW,
    cropH,
    -targetWidth / 2,
    -targetHeight / 2,
    targetWidth,
    targetHeight
  );

  ctx.restore();

  // Draw watermark if configured
  if (options.watermark) {
    drawWatermark(ctx, canvasWidth, canvasHeight, options.watermark);
  }

  // Export to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Erro ao gerar blob da imagem.'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({
          blob,
          url,
          width: canvasWidth,
          height: canvasHeight,
          size: blob.size,
        });
      },
      options.format,
      options.quality
    );
  });
}

export async function createBatchZip(
  items: { blob: Blob; fileName: string }[]
): Promise<Blob> {
  const zip = new JSZip();
  items.forEach((item) => {
    zip.file(item.fileName, item.blob);
  });
  return await zip.generateAsync({ type: 'blob' });
}
