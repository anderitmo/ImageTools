import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { ImageList } from './components/ImageList';
import { ControlsPanel } from './components/ControlsPanel';
import { CompareSlider } from './components/CompareSlider';
import { SettingsModal } from './components/SettingsModal';
import { useAppSettings, useTheme } from './hooks/useStorage';
import { ImageItem, ImageProcessingOptions, ImageFormat } from './types/image';
import {
  getImageMetadata,
  processImage,
  createBatchZip,
  formatBytes,
  formatToExtension,
} from './utils/imageProcessor';
import { Download, Trash2, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSettings } = useAppSettings();

  const [items, setItems] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  // Global processing options synced with default user settings
  const [globalOptions, setGlobalOptions] = useState<ImageProcessingOptions>({
    format: settings.defaultFormat,
    quality: settings.defaultQuality,
    resizeMode: 'none',
    scalePercentage: 100,
    maintainAspectRatio: true,
    aspectRatio: 'original',
    rotation: 0,
    flipH: false,
    flipV: false,
    filter: 'none',
  });

  // Keep global options synced if default settings update
  useEffect(() => {
    setGlobalOptions((prev) => ({
      ...prev,
      format: settings.defaultFormat,
      quality: settings.defaultQuality,
    }));
  }, [settings.defaultFormat, settings.defaultQuality]);

  // Selected Item
  const selectedItem = items.find((i) => i.id === selectedId) || items[0] || null;

  // Process a single item
  const processSingleItem = useCallback(
    async (itemToProcess: ImageItem, optionsToUse: ImageProcessingOptions) => {
      setItems((prev) =>
        prev.map((i) => (i.id === itemToProcess.id ? { ...i, status: 'processing' } : i))
      );

      try {
        const result = await processImage(itemToProcess.file, optionsToUse);
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemToProcess.id
              ? {
                  ...i,
                  status: 'done',
                  processedBlob: result.blob,
                  processedUrl: result.url,
                  processedWidth: result.width,
                  processedHeight: result.height,
                  processedSize: result.size,
                  customOptions: optionsToUse,
                }
              : i
          )
        );
      } catch (err: any) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === itemToProcess.id
              ? {
                  ...i,
                  status: 'error',
                  errorMessage: err?.message || 'Falha ao processar imagem.',
                }
              : i
          )
        );
      }
    },
    []
  );

  // Handle uploaded files
  const handleFilesSelected = async (files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      try {
        const meta = await getImageMetadata(file);
        const newItem: ImageItem = {
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          originalSize: file.size,
          originalWidth: meta.width,
          originalHeight: meta.height,
          previewUrl: meta.previewUrl,
          status: 'idle',
        };
        newItems.push(newItem);
      } catch (e) {
        console.error('Failed to read metadata for file', file.name, e);
      }
    }

    setItems((prev) => [...prev, ...newItems]);

    if (!selectedId && newItems.length > 0) {
      setSelectedId(newItems[0].id);
    }

    if (settings.autoProcess) {
      newItems.forEach((item) => {
        processSingleItem(item, globalOptions);
      });
    }
  };

  // Re-process image when user modifies options
  const handleOptionsChange = (updatedOptions: ImageProcessingOptions) => {
    setGlobalOptions(updatedOptions);
    if (selectedItem) {
      processSingleItem(selectedItem, updatedOptions);
    }
  };

  const handleApplyToAll = () => {
    items.forEach((item) => {
      processSingleItem(item, globalOptions);
    });
  };

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    for (const item of items) {
      const opts = item.customOptions ? (item.customOptions as ImageProcessingOptions) : globalOptions;
      await processSingleItem(item, opts);
    }
    setIsProcessingAll(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedId === id) {
      const remaining = items.filter((i) => i.id !== id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
    });
    setItems([]);
    setSelectedId(null);
  };

  const getOutputFileName = (item: ImageItem, format: ImageFormat) => {
    const originalName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const ext = formatToExtension(format);
    const prefix = settings.filePrefix || '';
    const suffix = settings.fileSuffix || '';
    return `${prefix}${originalName}${suffix}.${ext}`;
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.processedBlob || !item.processedUrl) return;
    const format = (item.customOptions?.format as ImageFormat) || globalOptions.format;
    const fileName = getOutputFileName(item, format);

    const a = document.createElement('a');
    a.href = item.processedUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    const readyItems = items.filter((i) => i.status === 'done' && i.processedBlob);
    if (readyItems.length === 0) return;

    const zipItems = readyItems.map((item) => {
      const format = (item.customOptions?.format as ImageFormat) || globalOptions.format;
      return {
        blob: item.processedBlob!,
        fileName: getOutputFileName(item, format),
      };
    });

    const zipBlob = await createBatchZip(zipItems);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'imagetools-otimizadas.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate totals
  const totalOriginalSize = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalProcessedSize = items.reduce(
    (acc, i) => acc + (i.processedSize !== undefined ? i.processedSize : i.originalSize),
    0
  );
  const totalSavings = totalOriginalSize - totalProcessedSize;
  const totalSavingsPercent =
    totalOriginalSize > 0 ? Math.round((totalSavings / totalOriginalSize) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Dropzone when empty */}
        {items.length === 0 ? (
          <div className="max-w-3xl mx-auto space-y-6 pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                Otimize, Redimensione e Converta
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-base max-w-xl mx-auto">
                Ferramenta rápida e 100% segura. Suas imagens nunca saem do seu navegador (processamento Web Canvas local).
              </p>
            </div>

            <Dropzone onFilesSelected={handleFilesSelected} />

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">🔥 Alta Compressão</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Reduza até 80% do tamanho das suas imagens preservando a qualidade visual.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">🔄 Conversão WebP</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Converta JPG/PNG para WebP para obter carregamento ultrarrápido na Web.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">📐 Redimensionamento</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Ajuste dimensões por porcentagem ou pixels fixos mantendo a proporção de aspecto.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Workspace layout when images are loaded */
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-sm">
                  {items.length} {items.length === 1 ? 'imagem' : 'imagens'}
                </div>

                {totalSavings > 0 && (
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                    Redução total de {totalSavingsPercent}% ({formatBytes(totalSavings)})
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleClearAll}
                  className="py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar tudo
                </button>

                {items.some((i) => i.status === 'done') && (
                  <button
                    onClick={handleDownloadZip}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar todas (.ZIP)
                  </button>
                )}
              </div>
            </div>

            {/* Grid Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Image List & Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Visual Compare Slider if selected item is done */}
                {selectedItem && selectedItem.status === 'done' && selectedItem.processedUrl && (
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <span>Comparador Antes vs Depois</span>
                      <span className="font-mono text-zinc-400">Arraste para comparar</span>
                    </div>

                    <CompareSlider
                      originalUrl={selectedItem.previewUrl}
                      processedUrl={selectedItem.processedUrl}
                    />
                  </div>
                )}

                {/* List of images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Fila de Imagens
                    </h3>
                  </div>

                  <ImageList
                    items={items}
                    selectedId={selectedItem?.id || null}
                    onSelect={(id) => setSelectedId(id)}
                    onRemove={handleRemoveItem}
                    onDownload={handleDownloadSingle}
                    onReProcess={(item) => processSingleItem(item, globalOptions)}
                  />

                  {/* Compact dropzone button */}
                  <Dropzone onFilesSelected={handleFilesSelected} compact />
                </div>
              </div>

              {/* Right Side: Options & Controls Panel (5 cols) */}
              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <ControlsPanel
                    options={globalOptions}
                    onChange={handleOptionsChange}
                    onApplyToAll={handleApplyToAll}
                    hasMultipleImages={items.length > 1}
                    onProcess={handleProcessAll}
                    isProcessing={isProcessingAll}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
        <p>ImageTools — Processamento local, limpo e seguro no seu navegador com suporte a JPG, PNG e WEBP.</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}
