export type Theme = 'system' | 'light' | 'dark';

// ponytail: disimpan terpisah dari Db agar inline script di index.html mencegah FOUC sebelum React dimuat
const STORAGE_KEY = 'arus:theme';
const listeners = new Set<() => void>();

export function parseTheme(raw: string | null): Theme {
  return raw === 'light' || raw === 'dark' ? raw : 'system';
}

export function nextTheme(current: Theme, systemIsDark: boolean): Theme {
  if (current === 'system') return systemIsDark ? 'light' : 'dark';
  if (systemIsDark) return current === 'light' ? 'dark' : 'system';
  return current === 'dark' ? 'light' : 'system';
}

export function getTheme(): Theme {
  try {
    return parseTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = theme;
}

export function setTheme(theme: Theme): void {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Abaikan jika localStorage diblokir
  }
  applyTheme(theme);
  for (const fn of listeners) fn();
}

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
