/**
 * Thin, type-safe wrapper around localStorage that fails gracefully when
 * storage is unavailable (e.g. private browsing, SSR, tests).
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore write failures */
    }
  },

  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
