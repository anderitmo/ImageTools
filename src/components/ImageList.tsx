import React from 'react';
import { ImageItem } from '../types/image';
import { formatBytes, formatToExtension } from '../utils/imageProcessor';
import { Download, Trash2, CheckCircle2, ArrowRight, Eye, RefreshCw, AlertCircle } from 'lucide-react';

interface ImageListProps {
  items: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDownload: (item: ImageItem) => void;
  onReProcess: (item: ImageItem) => void;
}

export const ImageList: React.FC<ImageListProps> = ({
  items,
  selectedId,
  onSelect,
  onRemove,
  onDownload,
  onReProcess,
}) => {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const hasProcessed = item.status === 'done' && item.processedSize !== undefined;

        let savingsPercent = 0;
        let savingsBytes = 0;
        if (hasProcessed && item.processedSize !== undefined) {
          savingsBytes = item.originalSize - item.processedSize;
          savingsPercent = Math.round((savingsBytes / item.originalSize) * 100);
        }

        return (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isSelected
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
              {/* Thumbnail */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-center">
                <img
                  src={item.processedUrl || item.previewUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </p>
                  {item.status === 'done' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{formatBytes(item.originalSize)}</span>
                  <span>({item.originalWidth}x{item.originalHeight}px)</span>

                  {hasProcessed && (
                    <>
                      <ArrowRight className="w-3 h-3 text-zinc-400" />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatBytes(item.processedSize!)}
                      </span>
                      {item.processedWidth && item.processedHeight && (
                        <span>({item.processedWidth}x{item.processedHeight}px)</span>
                      )}
                    </>
                  )}
                </div>

                {hasProcessed && savingsBytes > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span>Economia de {savingsPercent}% ({formatBytes(savingsBytes)})</span>
                  </div>
                )}
                {hasProcessed && savingsBytes < 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span>+ {Math.abs(savingsPercent)}% de tamanho (alta qualidade)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => onSelect(item.id)}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
                title="Visualizar e Ajustar"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Visualizar</span>
              </button>

              {hasProcessed && (
                <button
                  onClick={() => onDownload(item)}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs flex items-center gap-1.5"
                  title="Baixar Imagem"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Baixar</span>
                </button>
              )}

              <button
                onClick={() => onRemove(item.id)}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remover Imagem"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
