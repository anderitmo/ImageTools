// LocalStorage management for theme and app settings

const SETTINGS_KEY = 'imagetools_settings';
const THEME_KEY = 'imagetools_theme';

export const defaultSettings = {
  defaultFormat: 'image/jpeg',
  defaultQuality: 0.85,
  filePrefix: '',
  fileSuffix: '_otimizada',
  autoProcess: true,
};

export function getStoredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function initTheme() {
  const theme = getStoredTheme();
  setStoredTheme(theme);
  return theme;
}

export function getStoredSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
  }
  return { ...defaultSettings };
}

export function saveStoredSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
