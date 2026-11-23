import { DEFAULT_DARK_MODE, THEME_STORAGE_KEY } from '../constants/app';

export function getSavedTheme(): boolean {
  if (typeof window === 'undefined') return DEFAULT_DARK_MODE;

  try {
    const preference = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (preference === 'dark') return true;
    if (preference === 'light') return false;
  } catch {
    return DEFAULT_DARK_MODE;
  }

  return DEFAULT_DARK_MODE;
}

export function saveTheme(isDark: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // Keep the in-memory theme usable when browser storage is unavailable.
  }
}
