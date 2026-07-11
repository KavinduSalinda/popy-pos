import { describe, expect, it, beforeEach } from 'vitest';
import { storage } from './storage';

describe('storage service', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('stores and retrieves JSON values', () => {
    storage.set('test-key', { foo: 'bar' });
    expect(storage.get<{ foo: string }>('test-key')).toEqual({ foo: 'bar' });
  });

  it('returns null for missing keys', () => {
    expect(storage.get('missing')).toBeNull();
  });

  it('removes keys', () => {
    storage.set('temp', 1);
    storage.remove('temp');
    expect(storage.get('temp')).toBeNull();
  });
});
