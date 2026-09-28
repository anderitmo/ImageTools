import React, { useState } from 'react';
import { ImageProcessingOptions, ImageFormat, AspectRatioOption, FilterOption, WatermarkPosition } from '../types/image';
import { Sliders, Maximize2, Type, Sparkles, RefreshCw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface ControlsPanelProps {
  options: ImageProcessingOptions;
  onChange: (updatedOptions: ImageProcessingOptions) => void;
  onApplyToAll: () => void;
  hasMultipleImages: boolean;
  onProcess: () => void;
  isProcessing: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  options,
  onChange,
  onApplyToAll,
  hasMultipleImages,
  onProcess,
  isProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'convert' | 'resize' | 'effects'>('convert');

  const update = (partial: Partial<ImageProcessingOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-1">
        <button
          onClick={() => setActiveTab('convert')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'convert'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Otimizar & Converter
        </button>

        <button
          onClick={() => setActiveTab('resize')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'resize'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          Redimensionar
        </button>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeTab === 'effects'
              ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Efeitos & Marca D'água
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        {activeTab === 'convert' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Formato de Saída
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['image/webp', 'image/jpeg', 'image/png'] as ImageFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => update({ format: fmt })}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      options.format === fmt
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {fmt === 'image/webp' ? 'WEBP' : fmt === 'image/jpeg' ? 'JPG' : 'PNG'}
                  </button>
                ))}
              </div>
            </div>

            {options.format !== 'image/png' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-zinc-800 dark:text-zinc-200">Qualidade de Compressão</label>
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(options.quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={options.quality}
                  onChange={(e) => update({ quality: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Menor tamanho (0.1)</span>
                  <span>Melhor qualidade (1.0)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resize' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Modo de Redimensionamento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Original' },
                  { id: 'percentage', label: 'Porcentagem' },
                  { id: 'dimensions', label: 'Dimensões' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => update({ resizeMode: mode.id as any })}
                    className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
                      options.resizeMode === mode.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {options.resizeMode === 'percentage' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <label className="font-medium text-zinc-800 dark:text-zinc-200">Escala de Tamanho</label>
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {options.scalePercentage}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={options.scalePercentage}
                  onChange={(e) => update({ scalePercentage: parseInt(e.target.value) })}
                  className="w-full accent-blue-600 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>10%</span>
                  <span>100% (Original)</span>
                  <span>200%</span>
                </div>
              </div>
            )}

            {options.resizeMode === 'dimensions' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Largura (px)</label>
                    <input
                      type="number"
                      placeholder="Ex: 1920"
                      value={options.targetWidth || ''}
                      onChange={(e) => update({ targetWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Altura (px)</label>
                    <input
                      type="number"
                      placeholder="Ex: 1080"
                      value={options.targetHeight || ''}
                      onChange={(e) => update({ targetHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={options.maintainAspectRatio}
                    onChange={(e) => update({ maintainAspectRatio: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Manter proporção de aspecto (Aspect Ratio)
                </label>
              </div>
            )}

            {/* Rotation & Flips */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Rotação e Espelhamento
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const nextRot = ((options.rotation + 90) % 360) as 0 | 90 | 180 | 270;
                    update({ rotation: nextRot });
                  }}
                  className="flex-1 py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Girar ({options.rotation}°)
                </button>

                <button
                  onClick={() => update({ flipH: !options.flipH })}
                  className={`py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    options.flipH
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                  title="Inverter Horizontalmente"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  H
                </button>

                <button
                  onClick={() => update({ flipV: !options.flipV })}
                  className={`py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    options.flipV
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                  title="Inverter Verticalmente"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  V
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'effects' && (
          <div className="space-y-5">
            {/* Filter */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Filtros Visuais
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: 'Nenhum' },
                  { id: 'grayscale', label: 'Preto & Branco' },
                  { id: 'sepia', label: 'Sépia' },
                  { id: 'brightness', label: '+Brilho' },
                  { id: 'contrast', label: '+Contraste' },
                  { id: 'invert', label: 'Inverter' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    onClick={() => update({ filter: flt.id as FilterOption })}
                    className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                      options.filter === flt.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Marca D'água
              </label>

              <input
                type="text"
                placeholder="Texto da marca d'água (ex: © SuaMarca)"
                value={options.watermark?.text || ''}
                onChange={(e) =>
                  update({
                    watermark: {
                      text: e.target.value,
                      color: options.watermark?.color || '#ffffff',
                      opacity: options.watermark?.opacity ?? 0.7,
                      fontSize: options.watermark?.fontSize ?? 32,
                      position: options.watermark?.position || 'bottom-right',
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {options.watermark?.text && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Posição</label>
                      <select
                        value={options.watermark.position}
                        onChange={(e) =>
                          update({
                            watermark: {
                              ...options.watermark!,
                              position: e.target.value as WatermarkPosition,
                            },
                          })
                        }
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
                      >
                        <option value="center">Centro</option>
                        <option value="top-left">Superior Esquerdo</option>
                        <option value="top-right">Superior Direito</option>
                        <option value="bottom-left">Inferior Esquerdo</option>
                        <option value="bottom-right">Inferior Direito</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Cor</label>
                      <input
                        type="color"
                        value={options.watermark.color}
                        onChange={(e) =>
                          update({
                            watermark: {
                              ...options.watermark!,
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-full h-8 rounded-lg cursor-pointer bg-transparent border border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Opacidade</span>
                      <span>{Math.round(options.watermark.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={options.watermark.opacity}
                      onChange={(e) =>
                        update({
                          watermark: {
                            ...options.watermark!,
                            opacity: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-blue-600 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
        {hasMultipleImages && (
          <button
            onClick={onApplyToAll}
            className="w-full py-2 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Aplicar esta configuração a TODAS as imagens
          </button>
        )}

        <button
          onClick={onProcess}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? 'Processando...' : 'Processar Imagens'}
        </button>
      </div>
    </div>
  );
};
