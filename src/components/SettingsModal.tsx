import React, { useState, useEffect } from 'react';
import { AppSettings, ImageFormat } from '../types/image';
import { X, Save, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-md w-full border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Configurações e Preferências
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Default Format */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Formato Padrão de Exportação
            </label>
            <select
              value={formData.defaultFormat}
              onChange={(e) => setFormData({ ...formData, defaultFormat: e.target.value as ImageFormat })}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="image/webp">WEBP (Recomendado para Web)</option>
              <option value="image/jpeg">JPG / JPEG</option>
              <option value="image/png">PNG</option>
            </select>
          </div>

          {/* Default Quality */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1">
              <label className="font-medium text-zinc-800 dark:text-zinc-200">
                Qualidade Padrão de Compressão
              </label>
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(formData.defaultQuality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={formData.defaultQuality}
              onChange={(e) => setFormData({ ...formData, defaultQuality: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 bg-zinc-200 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Auto Process */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoProcess}
                onChange={(e) => setFormData({ ...formData, autoProcess: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Processar imagens automaticamente ao fazer upload
              </span>
            </label>
          </div>

          {/* File Naming */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Nomenclatura de Arquivos
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Prefixo</label>
                <input
                  type="text"
                  placeholder="Ex: opt-"
                  value={formData.filePrefix}
                  onChange={(e) => setFormData({ ...formData, filePrefix: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Sufixo</label>
                <input
                  type="text"
                  placeholder="Ex: -otimizada"
                  value={formData.fileSuffix}
                  onChange={(e) => setFormData({ ...formData, fileSuffix: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-400">
              Exemplo: {formData.filePrefix}foto{formData.fileSuffix}.{formData.defaultFormat.split('/')[1]}
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Salvar Preferências
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
