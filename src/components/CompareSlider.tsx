import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface CompareSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel?: string;
  processedLabel?: string;
}

export const CompareSlider: React.FC<CompareSliderProps> = ({
  originalUrl,
  processedUrl,
  originalLabel = 'Original',
  processedLabel = 'Otimizada',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden select-none cursor-ew-resize bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Processed (Right Side / Full width underlying image) */}
      <img
        src={processedUrl}
        alt="Otimizada"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-sm">
        {processedLabel}
      </div>

      {/* Original (Left Side / Clipped Image) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
          style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
        />
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-sm">
          {originalLabel}
        </div>
      </div>

      {/* Slider Bar */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
