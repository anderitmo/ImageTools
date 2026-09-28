import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Plus } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, compact = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  if (compact) {
    return (
      <div className="w-full">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Adicionar mais imagens
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[0.99]'
          : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50/80 dark:hover:bg-zinc-900'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
          <Upload className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Arraste e solte suas imagens aqui
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            ou clique para navegar no seu computador
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-2">
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono">JPG</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono">PNG</span>
          <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md font-mono">WEBP</span>
          <span>e mais</span>
        </div>
      </div>
    </div>
  );
};
