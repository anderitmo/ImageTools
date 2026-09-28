import {
  initTheme,
  getStoredTheme,
  setStoredTheme,
  getStoredSettings,
  saveStoredSettings,
} from './storage.js';

import {
  getImageMetadata,
  processImage,
  createBatchZip,
  formatBytes,
  formatToExtension,
} from './imageProcessor.js';

// Application State
let items = [];
let selectedId = null;
let appSettings = getStoredSettings();
let globalOptions = {
  format: appSettings.defaultFormat,
  quality: appSettings.defaultQuality,
  resizeMode: 'none',
  scalePercentage: 100,
  maintainAspectRatio: true,
  aspectRatio: 'original',
  rotation: 0,
  flipH: false,
  flipV: false,
  filter: 'none',
};

// DOM Element References
const themeToggleBtn = document.getElementById('themeToggleBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const settingDefaultFormat = document.getElementById('settingDefaultFormat');
const settingDefaultQuality = document.getElementById('settingDefaultQuality');
const settingPrefix = document.getElementById('settingPrefix');
const settingSuffix = document.getElementById('settingSuffix');
const settingAutoProcess = document.getElementById('settingAutoProcess');

const emptyState = document.getElementById('emptyState');
const workspace = document.getElementById('workspace');
const mainDropzone = document.getElementById('mainDropzone');
const mainFileInput = document.getElementById('mainFileInput');
const compactDropzone = document.getElementById('compactDropzone');
const compactFileInput = document.getElementById('compactFileInput');

const imageCountBadge = document.getElementById('imageCountBadge');
const savingsBadge = document.getElementById('savingsBadge');
const clearAllBtn = document.getElementById('clearAllBtn');
const downloadZipBtn = document.getElementById('downloadZipBtn');

const imageListContainer = document.getElementById('imageList');

// Compare Slider elements
const compareContainer = document.getElementById('compareContainer');
const compareSlider = document.getElementById('compareSlider');
const beforeImg = document.getElementById('beforeImg');
const afterImg = document.getElementById('afterImg');
const beforeImgWrapper = document.getElementById('beforeImgWrapper');
const sliderHandle = document.getElementById('sliderHandle');

// Control elements
const formatBtns = document.querySelectorAll('.format-btn');
const qualitySection = document.getElementById('qualitySection');
const qualityInput = document.getElementById('qualityInput');
const qualityValue = document.getElementById('qualityValue');
const resizeModeSelect = document.getElementById('resizeModeSelect');
const percentageControl = document.getElementById('percentageControl');
const scaleInput = document.getElementById('scaleInput');
const scaleValue = document.getElementById('scaleValue');
const dimensionsControl = document.getElementById('dimensionsControl');
const targetWidthInput = document.getElementById('targetWidthInput');
const targetHeightInput = document.getElementById('targetHeightInput');
const maintainAspectCheckbox = document.getElementById('maintainAspectCheckbox');
const rotateBtn = document.getElementById('rotateBtn');
const flipHBtn = document.getElementById('flipHBtn');
const flipVBtn = document.getElementById('flipVBtn');
const applyToAllBtn = document.getElementById('applyToAllBtn');
const processAllBtn = document.getElementById('processAllBtn');

// Initialize Application
function init() {
  initTheme();
  setupEventListeners();
  updateControlsUI();
  renderApp();
}

// Setup Event Listeners
function setupEventListeners() {
  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    const current = getStoredTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setStoredTheme(newTheme);
  });

  // Settings Modal
  settingsBtn.addEventListener('click', openSettingsModal);
  closeSettingsModalBtn.addEventListener('click', closeSettingsModal);
  cancelSettingsBtn.addEventListener('click', closeSettingsModal);
  saveSettingsBtn.addEventListener('click', handleSaveSettings);

  // File Upload Handlers
  mainDropzone.addEventListener('click', () => mainFileInput.click());
  mainFileInput.addEventListener('change', (e) => handleFilesSelected(e.target.files));

  compactDropzone.addEventListener('click', () => compactFileInput.click());
  compactFileInput.addEventListener('change', (e) => handleFilesSelected(e.target.files));

  setupDragAndDrop(mainDropzone);
  setupDragAndDrop(compactDropzone);

  // Toolbar Actions
  clearAllBtn.addEventListener('click', handleClearAll);
  downloadZipBtn.addEventListener('click', handleDownloadZip);

  // Compare Slider Interaction
  setupCompareSlider();

  // Control Interactions
  formatBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const format = btn.getAttribute('data-format');
      globalOptions.format = format;
      updateControlsUI();
      triggerAutoReprocessSelected();
    });
  });

  qualityInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    globalOptions.quality = val / 100;
    qualityValue.textContent = `${val}%`;
    triggerAutoReprocessSelected();
  });

  resizeModeSelect.addEventListener('change', (e) => {
    globalOptions.resizeMode = e.target.value;
    updateControlsUI();
    triggerAutoReprocessSelected();
  });

  scaleInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    globalOptions.scalePercentage = val;
    scaleValue.textContent = `${val}%`;
    triggerAutoReprocessSelected();
  });

  targetWidthInput.addEventListener('input', (e) => {
    globalOptions.targetWidth = e.target.value ? parseInt(e.target.value, 10) : null;
    triggerAutoReprocessSelected();
  });

  targetHeightInput.addEventListener('input', (e) => {
    globalOptions.targetHeight = e.target.value ? parseInt(e.target.value, 10) : null;
    triggerAutoReprocessSelected();
  });

  maintainAspectCheckbox.addEventListener('change', (e) => {
    globalOptions.maintainAspectRatio = e.target.checked;
    triggerAutoReprocessSelected();
  });

  rotateBtn.addEventListener('click', () => {
    globalOptions.rotation = (globalOptions.rotation + 90) % 360;
    triggerAutoReprocessSelected();
  });

  flipHBtn.addEventListener('click', () => {
    globalOptions.flipH = !globalOptions.flipH;
    triggerAutoReprocessSelected();
  });

  flipVBtn.addEventListener('click', () => {
    globalOptions.flipV = !globalOptions.flipV;
    triggerAutoReprocessSelected();
  });

  applyToAllBtn.addEventListener('click', handleApplyToAll);
  processAllBtn.addEventListener('click', handleProcessAll);
}

function setupDragAndDrop(element) {
  ['dragenter', 'dragover'].forEach((eventName) => {
    element.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.add('border-blue-500');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    element.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove('border-blue-500');
    });
  });

  element.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  });
}

function setupCompareSlider() {
  let isDragging = false;

  const updateSliderPos = (clientX) => {
    const rect = compareSlider.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percent = (x / rect.width) * 100;

    beforeImgWrapper.style.width = `${percent}%`;
    sliderHandle.style.left = `${percent}%`;
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    updateSliderPos(clientX);
  };

  const onEnd = () => {
    isDragging = false;
  };

  compareSlider.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSliderPos(e.clientX);
  });

  compareSlider.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateSliderPos(e.touches[0].clientX);
  });

  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove);
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

// Modal Settings
function openSettingsModal() {
  settingDefaultFormat.value = appSettings.defaultFormat;
  settingDefaultQuality.value = Math.round(appSettings.defaultQuality * 100);
  settingPrefix.value = appSettings.filePrefix || '';
  settingSuffix.value = appSettings.fileSuffix || '';
  settingAutoProcess.checked = appSettings.autoProcess;

  settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  settingsModal.classList.add('hidden');
}

function handleSaveSettings() {
  appSettings = {
    defaultFormat: settingDefaultFormat.value,
    defaultQuality: parseInt(settingDefaultQuality.value, 10) / 100,
    filePrefix: settingPrefix.value,
    fileSuffix: settingSuffix.value,
    autoProcess: settingAutoProcess.checked,
  };
  saveStoredSettings(appSettings);

  // Sync globalOptions
  globalOptions.format = appSettings.defaultFormat;
  globalOptions.quality = appSettings.defaultQuality;

  updateControlsUI();
  closeSettingsModal();
}

// Image Handling & Processing
async function handleFilesSelected(fileList) {
  const newFiles = Array.from(fileList);
  const newItems = [];

  for (const file of newFiles) {
    try {
      const meta = await getImageMetadata(file);
      const newItem = {
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
      console.error('Failed to read image metadata', file.name, e);
    }
  }

  items = [...items, ...newItems];

  if (!selectedId && newItems.length > 0) {
    selectedId = newItems[0].id;
  }

  renderApp();

  if (appSettings.autoProcess) {
    for (const item of newItems) {
      processSingleItem(item, globalOptions);
    }
  }
}

async function processSingleItem(itemToProcess, optionsToUse) {
  // Update item status
  items = items.map((i) => (i.id === itemToProcess.id ? { ...i, status: 'processing' } : i));
  renderApp();

  try {
    const result = await processImage(itemToProcess.file, optionsToUse);
    items = items.map((i) =>
      i.id === itemToProcess.id
        ? {
            ...i,
            status: 'done',
            processedBlob: result.blob,
            processedUrl: result.url,
            processedWidth: result.width,
            processedHeight: result.height,
            processedSize: result.size,
            customOptions: { ...optionsToUse },
          }
        : i
    );
  } catch (err) {
    items = items.map((i) =>
      i.id === itemToProcess.id
        ? {
            ...i,
            status: 'error',
            errorMessage: err?.message || 'Falha ao processar imagem.',
          }
        : i
    );
  }

  renderApp();
}

function triggerAutoReprocessSelected() {
  const selectedItem = items.find((i) => i.id === selectedId);
  if (selectedItem) {
    processSingleItem(selectedItem, globalOptions);
  }
}

function handleApplyToAll() {
  items.forEach((item) => {
    processSingleItem(item, globalOptions);
  });
}

async function handleProcessAll() {
  processAllBtn.disabled = true;
  processAllBtn.textContent = 'Processando...';

  for (const item of items) {
    const opts = item.customOptions || globalOptions;
    await processSingleItem(item, opts);
  }

  processAllBtn.disabled = false;
  processAllBtn.textContent = 'Processar Todas as Imagens';
}

function handleClearAll() {
  items.forEach((item) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
  });
  items = [];
  selectedId = null;
  renderApp();
}

function getOutputFileName(item, format) {
  const originalName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
  const ext = formatToExtension(format);
  const prefix = appSettings.filePrefix || '';
  const suffix = appSettings.fileSuffix || '';
  return `${prefix}${originalName}${suffix}.${ext}`;
}

function handleDownloadSingle(item) {
  if (!item.processedBlob || !item.processedUrl) return;
  const format = item.customOptions?.format || globalOptions.format;
  const fileName = getOutputFileName(item, format);

  const a = document.createElement('a');
  a.href = item.processedUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function handleDownloadZip() {
  const readyItems = items.filter((i) => i.status === 'done' && i.processedBlob);
  if (readyItems.length === 0) return;

  const zipItems = readyItems.map((item) => {
    const format = item.customOptions?.format || globalOptions.format;
    return {
      blob: item.processedBlob,
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
}

// UI Rendering Functions
function updateControlsUI() {
  formatBtns.forEach((btn) => {
    if (btn.getAttribute('data-format') === globalOptions.format) {
      btn.className =
        'format-btn py-2 px-3 text-xs font-semibold rounded-xl border border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
    } else {
      btn.className =
        'format-btn py-2 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50';
    }
  });

  // Quality visibility
  if (globalOptions.format === 'image/png') {
    qualitySection.classList.add('hidden');
  } else {
    qualitySection.classList.remove('hidden');
  }

  const qualityVal = Math.round((globalOptions.quality || 0.85) * 100);
  qualityInput.value = qualityVal;
  qualityValue.textContent = `${qualityVal}%`;

  // Resize Mode
  resizeModeSelect.value = globalOptions.resizeMode;
  if (globalOptions.resizeMode === 'percentage') {
    percentageControl.classList.remove('hidden');
    dimensionsControl.classList.add('hidden');
  } else if (globalOptions.resizeMode === 'dimensions') {
    percentageControl.classList.add('hidden');
    dimensionsControl.classList.remove('hidden');
  } else {
    percentageControl.classList.add('hidden');
    dimensionsControl.classList.add('hidden');
  }

  scaleInput.value = globalOptions.scalePercentage || 100;
  scaleValue.textContent = `${globalOptions.scalePercentage || 100}%`;

  targetWidthInput.value = globalOptions.targetWidth || '';
  targetHeightInput.value = globalOptions.targetHeight || '';
  maintainAspectCheckbox.checked = globalOptions.maintainAspectRatio !== false;
}

function renderApp() {
  if (items.length === 0) {
    emptyState.classList.remove('hidden');
    workspace.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  workspace.classList.remove('hidden');

  // Badge statistics
  imageCountBadge.textContent = `${items.length} ${items.length === 1 ? 'imagem' : 'imagens'}`;

  const totalOriginal = items.reduce((acc, i) => acc + i.originalSize, 0);
  const totalProcessed = items.reduce(
    (acc, i) => acc + (i.processedSize !== undefined ? i.processedSize : i.originalSize),
    0
  );
  const totalSavings = totalOriginal - totalProcessed;

  if (totalSavings > 0) {
    const percent = Math.round((totalSavings / totalOriginal) * 100);
    savingsBadge.textContent = `Redução total de ${percent}% (${formatBytes(totalSavings)})`;
    savingsBadge.classList.remove('hidden');
  } else {
    savingsBadge.classList.add('hidden');
  }

  // Selected item
  const selectedItem = items.find((i) => i.id === selectedId) || items[0] || null;
  if (selectedItem && selectedId !== selectedItem.id) {
    selectedId = selectedItem.id;
  }

  // Compare Slider Render
  if (selectedItem && selectedItem.status === 'done' && selectedItem.processedUrl) {
    compareContainer.classList.remove('hidden');
    beforeImg.src = selectedItem.previewUrl;
    afterImg.src = selectedItem.processedUrl;

    // Set height alignment
    const updateImageDimensions = () => {
      const sliderWidth = compareSlider.clientWidth;
      beforeImg.style.width = `${sliderWidth}px`;
      beforeImg.style.height = `${compareSlider.clientHeight}px`;
    };
    requestAnimationFrame(updateImageDimensions);
  } else {
    compareContainer.classList.add('hidden');
  }

  // Render Image List
  imageListContainer.innerHTML = '';
  items.forEach((item) => {
    const isSelected = item.id === selectedId;

    const card = document.createElement('div');
    card.className = `p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
      isSelected
        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs'
        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
    }`;

    card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return; // Ignore button clicks inside card
      selectedId = item.id;
      renderApp();
    });

    // Calc size reduction for this card
    let sizeBadge = '';
    if (item.status === 'done' && item.processedSize) {
      const diff = item.originalSize - item.processedSize;
      const pct = Math.round((diff / item.originalSize) * 100);
      const isReduction = diff > 0;
      sizeBadge = `<span class="text-xs px-2 py-0.5 rounded-full font-semibold ${
        isReduction
          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
      }">${isReduction ? '-' + pct + '%' : '+' + Math.abs(pct) + '%'}</span>`;
    }

    card.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <img src="${item.previewUrl}" class="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
        <div class="min-w-0">
          <p class="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">${item.name}</p>
          <div class="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>${item.originalWidth}x${item.originalHeight}px</span>
            <span>•</span>
            <span>${formatBytes(item.originalSize)}</span>
            ${
              item.status === 'done'
                ? `<span>→</span> <span class="font-bold text-zinc-700 dark:text-zinc-300">${formatBytes(item.processedSize)}</span>`
                : ''
            }
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        ${sizeBadge}
        ${
          item.status === 'done'
            ? `<button class="download-item-btn p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors" title="Baixar imagem">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </button>`
            : item.status === 'processing'
            ? `<span class="text-xs text-blue-500 font-medium">Processando...</span>`
            : ''
        }
        <button class="remove-item-btn p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors" title="Remover">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    `;

    // Button event listeners inside item card
    const downloadBtn = card.querySelector('.download-item-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => handleDownloadSingle(item));
    }

    const removeBtn = card.querySelector('.remove-item-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.processedUrl) URL.revokeObjectURL(item.processedUrl);
        items = items.filter((i) => i.id !== item.id);
        if (selectedId === item.id) {
          selectedId = items.length > 0 ? items[0].id : null;
        }
        renderApp();
      });
    }

    imageListContainer.appendChild(card);
  });
}

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);
