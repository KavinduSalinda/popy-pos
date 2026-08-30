export type ServerMode = 'localhost' | 'cloud' | 'custom';

export interface ServerConfig {
  mode: ServerMode;
  url: string;
}

export const SERVER_STORAGE_KEY = 'popy.serverConfig';

export const DEFAULT_LOCAL_API_URL = 'http://127.0.0.1:8000/api';
export const DEFAULT_CLOUD_API_URL = 'https://kavindu10.pythonanywhere.com/api';

/**
 * Checks whether the app is currently running inside an Electron environment.
 */
export const isElectron = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { electron?: unknown }).electron ||
      window.navigator.userAgent.toLowerCase().includes('electron'),
  );
};

export const getDefaultApiBaseUrl = (): string => {
  if (isElectron()) {
    return DEFAULT_LOCAL_API_URL;
  }
  return import.meta.env.VITE_API_BASE_URL ?? '/api';
};

export const getServerConfig = (): ServerConfig => {
  if (typeof window === 'undefined') {
    return {
      mode: isElectron() ? 'localhost' : 'cloud',
      url: getDefaultApiBaseUrl(),
    };
  }

  try {
    const raw = window.localStorage.getItem(SERVER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ServerConfig>;
      if (parsed.url && typeof parsed.url === 'string') {
        return {
          mode: parsed.mode ?? (parsed.url.includes('127.0.0.1') || parsed.url.includes('localhost') ? 'localhost' : 'custom'),
          url: parsed.url.replace(/\/+$/, ''),
        };
      }
    }
  } catch {
    /* fallback below */
  }

  const defaultUrl = getDefaultApiBaseUrl();
  const defaultMode: ServerMode =
    defaultUrl.includes('127.0.0.1') || defaultUrl.includes('localhost')
      ? 'localhost'
      : defaultUrl.startsWith('http')
        ? 'cloud'
        : isElectron()
          ? 'localhost'
          : 'custom';

  return {
    mode: defaultMode,
    url: defaultUrl,
  };
};

export const getApiBaseUrl = (): string => {
  return getServerConfig().url;
};

export const setServerConfig = (config: ServerConfig): void => {
  try {
    const sanitized = {
      mode: config.mode,
      url: config.url.trim().replace(/\/+$/, ''),
    };
    window.localStorage.setItem(SERVER_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('popy:server-config-changed', { detail: sanitized }));
  } catch {
    /* ignore storage errors */
  }
};

/**
 * Tests connection to the provided API base URL.
 * Returns true if reachable with response status or latency.
 */
export const testServerConnection = async (
  apiUrl: string,
): Promise<{ ok: boolean; message: string; latencyMs?: number }> => {
  const cleanUrl = apiUrl.trim().replace(/\/+$/, '');
  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Try a simple ping / auth endpoint with options or GET
    const response = await fetch(`${cleanUrl}/auth/login`, {
      method: 'OPTIONS',
      signal: controller.signal,
    }).catch(async () => {
      // If OPTIONS isn't handled or fails, fallback to GET on base / or /catalog
      return await fetch(`${cleanUrl}`, {
        method: 'GET',
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - start);

    if (response.status < 500) {
      return { ok: true, message: `Connected (${latencyMs}ms)`, latencyMs };
    }
    return {
      ok: true,
      message: `Server responded with HTTP ${response.status} (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - start);
    const errorMsg = err instanceof Error ? err.message : 'Connection failed';
    return { ok: false, message: `Unreachable: ${errorMsg} (${latencyMs}ms)`, latencyMs };
  }
};
