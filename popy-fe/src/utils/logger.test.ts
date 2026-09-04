import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits a structured JSON error entry', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const entry = logger.error('queue failed', { shopId: '1', reason: 'network' });

    expect(entry.level).toBe('error');
    expect(entry.message).toBe('queue failed');
    expect(entry.context).toEqual({ shopId: '1', reason: 'network' });
    expect(spy).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(payload).toMatchObject({
      level: 'error',
      message: 'queue failed',
      context: { shopId: '1', reason: 'network' },
    });
  });
});
